// Import required modules
const mysql = require("mysql2");
const inquirer = require("inquirer");
require("console.table");

// Create a connection to the database
// Please enter your connection information here
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Enter Your Passowrd Here',
  database: 'employee_db'
});

// Connect to the database and start the application
connection.connect(err => {
  if (err) throw err;
  console.log("Connected to the database");
  start();
});

// Main function to start the application
function start() {
  inquirer
    .prompt({
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        "Exit"
      ]
    })
    .then(answer => {
      switch (answer.action) {
        case "View all departments":
          viewDepartments();
          break;
        case "View all roles":
          viewRoles();
          break;
        case "View all employees":
          viewEmployees();
          break;
        case "Add a department":
          addDepartment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Update an employee role":
          updateEmployeeRole();
          break;
        case "Exit":
          console.log("Goodbye!");
          connection.end();
          break;
      }
    });
}
// Function to view all departments
function viewDepartments() {
  connection.query("SELECT * FROM department", (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

// Function to view all roles 
function viewRoles() {
  connection.query("SELECT * FROM role", (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

// Function to view all employees
// SQL query to retrieve employee data along with role and department information
function viewEmployees() {
  const query =
    `SELECT 
      e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary,
      CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN department d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id`;

  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res); // Display the result in a table format
    start();
  });
}

// Function to add departments
function addDepartment() {
  inquirer.prompt({
    type: "input",
    name: "name",
    message: "Enter the name of the department:"
  }).then(answer => {
    connection.query("INSERT INTO department SET ?", { name: answer.name }, (err, res) => {
      if (err) throw err;
      console.log(`Department "${answer.name}" added successfully!`);
      start();
    });
  });
}

// Function to add roles including salary and department and title 
function addRole() {
  connection.query("SELECT * FROM department", (err, departments) => {
    if (err) throw err;

    const departmentChoices = departments.map(department => ({
      name: department.name,
      value: department.id
    }));

    inquirer.prompt([
      {
        type: "input",
        name: "title",
        message: "Enter the title of the role:"
      },
      {
        type: "input",
        name: "salary",
        message: "Enter the salary for the role:"
      },
      {
        type: "list",
        name: "department_id",
        message: "Select the department for the role:",
        choices: departmentChoices
      }
    ]).then(answer => {
      connection.query("INSERT INTO role SET ?", answer, (err, res) => {
        if (err) throw err;
        console.log(`Role "${answer.title}" added successfully!`);
        start();
      });
    });
  });
}

// Function to add roles including first and last name, role 
function addEmployee() {
  connection.query("SELECT * FROM role", (err, roles) => {
    if (err) throw err;

    const roleChoices = roles.map(role => ({
      name: role.title,
      value: role.id
    }));

    inquirer.prompt([
      {
        type: "input",
        name: "first_name",
        message: "Enter the first name of the employee:"
      },
      {
        type: "input",
        name: "last_name",
        message: "Enter the last name of the employee:"
      },
      {
        type: "list",
        name: "role_id",
        message: "Select the role for the employee:",
        choices: roleChoices
      }
    ]).then(answer => {
      connection.query("INSERT INTO employee SET ?", answer, (err, res) => {
        if (err) throw err;
        console.log(`Employee "${answer.first_name} ${answer.last_name}" added successfully!`);
        start();
      });
    });
  });
}

// function to uplate employee role
function updateEmployeeRole() {
  connection.query("SELECT * FROM employee", (err, employees) => {
    if (err) throw err;

    const employeeChoices = employees.map(employee => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id
    }));

    connection.query("SELECT * FROM role", (err, roles) => {
      if (err) throw err;

      const roleChoices = roles.map(role => ({
        name: role.title,
        value: role.id
      }));

      inquirer.prompt([
        {
          type: "list",
          name: "employee_id",
          message: "Select the employee to update:",
          choices: employeeChoices
        },
        {
          type: "list",
          name: "role_id",
          message: "Select the new role for the employee:",
          choices: roleChoices
        }
      ]).then(answer => {
        connection.query("UPDATE employee SET role_id = ? WHERE id = ?", [answer.role_id, answer.employee_id], (err, res) => {
          if (err) throw err;
          console.log("Employee role updated successfully!");
          start();
        });
      });
    });
  });
}
