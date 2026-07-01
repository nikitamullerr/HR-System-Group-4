console.log("JS is connected");
const employeeContainer = document.getElementById("employeeContainer");

const employees = [
{
employeeId:1,
name:"Sibongile Nkosi",
position:"Software Engineer",
department:"Development",
salary:70000,
employmentHistory:"Joined in 2015, promoted to Senior in 2018",
contact:"sibongile.nkosi@moderntech.com"
},
{
employeeId:2,
name:"Lungile Moyo",
position:"HR Manager",
department:"HR",
salary:80000,
employmentHistory:"Joined in 2013, promoted to Manager in 2017",
contact:"lungile.moyo@moderntech.com"
},
{
employeeId:3,
name:"Thabo Molefe",
position:"Quality Analyst",
department:"QA",
salary:55000,
employmentHistory:"Joined in 2018",
contact:"thabo.molefe@moderntech.com"
},
{
employeeId:4,
name:"Keshav Naidoo",
position:"Sales Representative",
department:"Sales",
salary:60000,
employmentHistory:"Joined in 2020",
contact:"keshav.naidoo@moderntech.com"
},
{
employeeId:5,
name:"Zanele Khumalo",
position:"Marketing Specialist",
department:"Marketing",
salary:58000,
employmentHistory:"Joined in 2019",
contact:"zanele.khumalo@moderntech.com"
},
{
employeeId:6,
name:"Sipho Zulu",
position:"UI/UX Designer",
department:"Design",
salary:65000,
employmentHistory:"Joined in 2016",
contact:"sipho.zulu@moderntech.com"
},
{
employeeId:7,
name:"Naledi Moeketsi",
position:"DevOps Engineer",
department:"IT",
salary:72000,
employmentHistory:"Joined in 2017",
contact:"naledi.moeketsi@moderntech.com"
},
{
employeeId:8,
name:"Farai Gumbo",
position:"Content Strategist",
department:"Marketing",
salary:56000,
employmentHistory:"Joined in 2021",
contact:"farai.gumbo@moderntech.com"
},
{
employeeId:9,
name:"Karabo Dlamini",
position:"Accountant",
department:"Finance",
salary:62000,
employmentHistory:"Joined in 2018",
contact:"karabo.dlamini@moderntech.com"
},
{
employeeId:10,
name:"Fatima Patel",
position:"Customer Support Lead",
department:"Support",
salary:58000,
employmentHistory:"Joined in 2016",
contact:"fatima.patel@moderntech.com"
}
];

/*Helper Functions*/
function getInitials(name) {
    return name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase();
}

function getDepartmentClass(department) {
    return department.toLowerCase().replace("/", "");
}

function getStatusClass(status) {
    if (status === "Active") return "active";
    if (status === "On Leave") return "leave";
    return "pending";
}

/*Render Employees*/
function renderEmployees(employeeList) {

    employeeContainer.innerHTML = "";

    employeeList.forEach(employee => {

        const status = "Active";
        const statusClass = getStatusClass(status);
        const rating = "4.5";

        const card = document.createElement("div");
        card.className = "employee-card";

        card.innerHTML = `
        
            <div class="employee-main">

                <div class="employee-avatar">
                    ${getInitials(employee.name)}
                </div>

                <div class="employee-details">
                    <h4>${employee.name}</h4>
                    <p>${employee.position}</p>
                </div>

            </div>

            <div>
                <span class="department-pill ${getDepartmentClass(employee.department)}">
                    ${employee.department}
                </span>
            </div>
            
            <div>
                <span class="status ${statusClass}">
                    ${status}
                </span>
            </div>

            <div class="rating">
                ${rating}
            </div>

            <div class="action-buttons">

                <button class="view-btn"
                    onclick="viewEmployee(${employee.employeeId})">
                    View
                </button>

                <button class="edit-btn">
                    Edit
                </button>

            </div>

        `;
        employeeContainer.appendChild(card);
    });

}

renderEmployees(employees);
