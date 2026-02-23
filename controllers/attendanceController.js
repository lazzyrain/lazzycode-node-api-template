const {sendResponse, httpStatusCode} = require('../helpers/appHelper');
const { ProcessAttendance } = require('../helpers/attendanceHelper');

const BASE_URL = '';
const PERIODE = '2026-02';

const AttendanceController = {
    getListScheduleWorking: async () => {
        const getResult = await fetch (BASE_URL + '/attendance/listScheduleWorking?periode=' + PERIODE);
        const jsonResult = await getResult.json();
        const result = jsonResult.data ?? [];

        return result;
    },

    getListRawAttendance: async () => {
        const getResult = await fetch (BASE_URL + '/attendance/listRawAttendance?periode=' + PERIODE);
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