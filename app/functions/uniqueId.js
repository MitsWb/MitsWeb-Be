const generateStudentId = (rollNo, department, passoutYear) => {
  let finalrollNo = "",
    zeros = "";
  for (var i = 0; i < 3 - String(Number(rollNo)).length; i++) {
    zeros += "0";
  }
  finalrollNo =
    Number(passoutYear) -
    4 -
    2000 +
    department.substr(0, 2) +
    zeros +
    Number(rollNo);

  return finalrollNo;
};

const generateFacultyId = (joiningYear, internalId) => {
  if (joiningYear && internalId) {
    let id = ("000" + internalId).slice(-3);
    const facultyId = `EMP${id}/${joiningYear % 100}`;
    return facultyId;
  }
  return -1;
};

module.exports = {
  generateStudentId,
  generateFacultyId,
};
