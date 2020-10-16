const mysql = require('mysql');
const inquirer = require('inquirer');

var connection = mysql.createConnection({
    multipleStatements: true,
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employee_db"
});


connection.connect(function (err) {
    if (err) throw err;
    start();
});

function start() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "Please select an action:",
            choices: [
                "View departments",
                "View roles",
                "View employees",
                "Add department",
                "Add role",
                "Add employee",
                "Update employee role",
                "Exit"
            ],

        })
        .then(function (answer) {
            if (answer.action === "View departments") {
                viewDepartments();
            } else if (answer.action === "View roles") {
                viewRoles();
            } else if (answer.action === "View employees") {
                viewEmployees();
            } else if (answer.action === "Add department") {
                addDepartment();
            } else if (answer.action === "Add role") {
                addRole();
            } else if (answer.action === "Add employee") {
                addEmployee();
            } else if (answer.action === "Update employee role") {
                updateRole();
            }
            else if (answer.action === "Exit") {
                connection.end();
            }
        })
}

function viewDepartments() {
    var query = "SELECT * FROM department";
    connection.query(query, function (err, res) {
        console.log(`DEPARTMENTS:`)
        res.forEach(department => {
            console.log(`ID: ${department.id} | Name: ${department.name}`)
        })
        start();
    });
};

function viewRoles() {
    var query = "SELECT * FROM role";
    connection.query(query, function (err, res) {
        console.log(`ROLES:`)
        res.forEach(role => {
            console.log(`ID: ${role.id} | Title: ${role.title} | Salary: ${role.salary} | Department ID: ${role.department_id}`);
        })
        start();
    });
};

function viewEmployees() {
    var query = "SELECT * FROM employee";
    connection.query(query, function (err, res) {
        console.log(`EMPLOYEES:`)
        res.forEach(employee => {
            console.log(`ID: ${employee.id} | Name: ${employee.first_name} ${employee.last_name} | Role ID: ${employee.role_id} | Manager ID: ${employee.manager_id}`);
        })
        start();
    });
};

function addDepartment() {
    inquirer
        .prompt({
            type: "input",
            message: "Please input new department name:",
            name: "department"
        })

        .then(function (answer) {
            var query = "INSERT INTO department (name) VALUES ( ? )";
            connection.query(query, answer.department, function (err, res) {
                console.log(`Added department: ${(answer.department).toUpperCase()}.`)
            })
            viewDepartments();
        })
}

function addRole() {
    connection.query("SELECT * FROM department", function (err, res) {
        if (err) throw (err);
        inquirer
            .prompt([{
                type: "input",
                message: "Please input role title:",
                name: "title"
            },
            {
                type: "input",
                message: "Please input role salary:",
                name: "salary"
            },
            {
                type: "list",
                message: "Please select role department:",
                name: "departmentName",
                choices: function () {
                    var choicesArray = [];
                    res.forEach(res => {
                        choicesArray.push(
                            res.name
                        );
                    })
                    return choicesArray;
                }
            }
            ])

            .then(function (answer) {
                const department = answer.departmentName;
                connection.query("SELECT * FROM DEPARTMENT", function (err, res) {

                    if (err) throw (err);
                    let filteredDept = res.filter(function (res) {
                        return res.name == department;
                    }
                    )
                    let id = filteredDept[0].id;
                    let query = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
                    let values = [answer.title, parseInt(answer.salary), id]
                    console.log(values);
                    connection.query(query, values,
                        function (err, res, fields) {
                            console.log(`Added role: ${(values[0]).toUpperCase()}.`)
                        })
                    viewRoles()
                })
            })
    })
}

async function addEmployee() {
    connection.query("SELECT * FROM role", function (err, result) {
        if (err) throw (err);
        inquirer
            .prompt([{
                type: "input",
                message: "Please input employee's first name:",
                name: "firstName"
            },
            {
                type: "input",
                message: "Please input employee's last name:",
                name: "lastName"
            },
            {
                type: "list",
                message: "Please select employee role:",
                name: "roleName",
                choices: function () {
                    rolesArray = [];
                    result.forEach(result => {
                        rolesArray.push(
                            result.title
                        );
                    })
                    return rolesArray;
                }
            }
            ])

            .then(function (answer) {
                console.log(answer);
                const role = answer.roleName;
                connection.query('SELECT * FROM role', function (err, res) {
                    if (err) throw (err);
                    let filteredRole = res.filter(function (res) {
                        return res.title == role;
                    })
                    let roleId = filteredRole[0].id;
                    connection.query("SELECT * FROM employee", function (err, res) {
                        inquirer
                            .prompt([
                                {
                                    type: "list",
                                    message: "Please select employee manager:",
                                    name: "manager",
                                    choices: function () {
                                        managersArray = []
                                        res.forEach(res => {
                                            managersArray.push(
                                                res.last_name)

                                        })
                                        return managersArray;
                                    }
                                }
                            ])

                            .then(function (managerAnswer) {
                                const manager = managerAnswer.manager;
                                connection.query('SELECT * FROM employee', function (err, res) {
                                    if (err) throw (err);
                                    let filteredManager = res.filter(function (res) {
                                        return res.last_name == manager;
                                    })
                                    let managerId = filteredManager[0].id;
                                    console.log(managerAnswer);
                                    let query = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                                    let values = [answer.firstName, answer.lastName, roleId, managerId]
                                    console.log(values);
                                    connection.query(query, values,
                                        function (err, res, fields) {
                                            console.log(`Added employee: ${(values[0]).toUpperCase()}.`)
                                        })
                                    viewEmployees();
                                })
                            })
                    })
                })
            })
    })
}

function updateRole() {
    connection.query('SELECT * FROM employee', function (err, result) {
        if (err) throw (err);
        inquirer
            .prompt([
                {
                    type: "list",
                    message: "Please select an employee to change role:",
                    name: "employeeName",
                    choices: function () {
                        employeeArray = [];
                        result.forEach(result => {
                            employeeArray.push(
                                result.last_name
                            );
                        })
                        return employeeArray;
                    }
                }
            ])

            .then(function (answer) {
                console.log(answer);
                const name = answer.employeeName;
                connection.query("SELECT * FROM role", function (err, res) {
                    inquirer
                        .prompt([
                            {
                                type: "list",
                                message: `Please select new role for ${name}:`,
                                name: "role",
                                choices: function () {
                                    rolesArray = [];
                                    res.forEach(res => {
                                        rolesArray.push(
                                            res.title)

                                    })
                                    return rolesArray;
                                }
                            }
                        ]).then(function (rolesAnswer) {
                            const role = rolesAnswer.role;
                            console.log(rolesAnswer.role);
                            connection.query('SELECT * FROM role WHERE title = ?', [role], function (err, res) {
                                if (err) throw (err);
                                let roleId = res[0].id;
                                let query = "UPDATE employee SET role_id ? WHERE last_name ?";
                                let values = [roleId, name]
                                console.log(values);
                                connection.query(query, values,
                                    function (err, res, fields) {
                                        console.log(`Updated ${name}'s role to ${role}.`)
                                    })
                                viewEmployees();
                            })
                        })
                })
            })
    })

}