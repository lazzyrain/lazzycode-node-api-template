const {sendResponse, httpStatusCode} = require('../helpers/appHelper');
const { ProcessAttendance } = require('../helpers/attendanceHelper');

const PERIODE = '2026-01';

const AttendanceController = {
    getListScheduleWorking: async () => {
        const getResult = await fetch ('http://localhost/hr-management/api/attendance/listScheduleWorking?periode=' + PERIODE);
        const jsonResult = await getResult.json();
        const result = jsonResult.data ?? [];

        return result;
    },

    getListRawAttendance: async () => {
        const getResult = await fetch ('http://localhost/hr-management/api/attendance/listRawAttendance?periode=' + PERIODE);
        const jsonResult = await getResult.json();
        const result = jsonResult.data ?? [];

        return result;
    },

    calculateAttendance: async () => {
        const listScheduleWorking = await AttendanceController.getListScheduleWorking();
        const listRawAttendance = await AttendanceController.getListRawAttendance();

        const result = await ProcessAttendance(listScheduleWorking, listRawAttendance);
        // const result = {listScheduleWorking, listRawAttendance};

        sendResponse(httpStatusCode.HTTP_OK, 'Done', result);
    }
}

module.exports = AttendanceController