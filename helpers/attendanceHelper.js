const formatDuration = (ms) => {
    if (ms <= 0) return "00:00:00";

    const totalSeconds = Math.floor(ms / 1000);

    const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const ss = String(totalSeconds % 60).padStart(2, '0');

    return `${hh}:${mm}:${ss}`;
}

const formatDateTime = (date) => {
    const pad = n => String(n).padStart(2, '0');

    return (
        date.getFullYear() + '-' +
        pad(date.getMonth() + 1) + '-' +
        pad(date.getDate()) + ' ' +
        pad(date.getHours()) + ':' +
        pad(date.getMinutes()) + ':' +
        pad(date.getSeconds())
    );
}

export const ProcessAttendance = async (scheduleList, fingerList) => {
    const fingerByEmp = {};
    for (const finger of fingerList) {
        if (!fingerByEmp[finger.emp_id]) fingerByEmp[finger.emp_id] = [];

        fingerByEmp[finger.emp_id].push({
            time: new Date(finger.CHECKTIME),
            type: finger.CHECKTYPE
        });
    }

    for (const empId in fingerByEmp) {
        fingerByEmp[empId].sort((a, b) => a.time - b.time);
    }

    const result = [];
    for (const schedule of scheduleList) {
        const empId = schedule.employee_id;

        const shiftInBase = new Date(`${schedule.attendance_in}`);
        let shiftOutBase = new Date(`${schedule.attendance_out}`);

        const before = 4 * 3600 * 1000;
        const after = 8 * 3600 * 1000;

        const windowInStart = new Date(shiftInBase.getTime() - before);
        const windowInEnd = shiftOutBase;
        const windowOutStart = shiftInBase;
        let windowOutEnd = new Date(shiftOutBase.getTime() + after);

        let overtimeCallbackAttendanceIn = schedule.overtime_callback_attendance_in;
        if (overtimeCallbackAttendanceIn) {
            overtimeCallbackAttendanceIn = new Date(`${overtimeCallbackAttendanceIn}`);

            // windowOutEnd maksimal sebelum overtimeCallbackAttendanceIn
            if (overtimeCallbackAttendanceIn < windowOutEnd) {
                windowOutEnd = overtimeCallbackAttendanceIn;
            }
        }

        const fingers = fingerByEmp[empId] || [];

        let actualIn = null;
        let actualOut = null;

        for (const finger of fingers) {
            const fingerTime = finger.time;

            if (
                finger.type === "I" &&
                !actualIn &&
                fingerTime >= windowInStart &&
                fingerTime <= windowInEnd
            ) {
                actualIn = fingerTime;
            }

            if (
                finger.type === "O" &&
                !actualOut &&
                fingerTime >= windowOutStart &&
                fingerTime <= windowOutEnd
            ) {
                actualOut = fingerTime;
            }
        }

        let status = "";
        let late = "00:00";
        let early = "00:00";

        if (!actualIn || !actualOut) {
            status = "INCOMPLETE"; // TIDAK LENGKAP
        }

        if ((shiftInBase && shiftOutBase) && (!actualIn && !actualOut)) {
            status = "ABSENT"; // TIDAK HADIR
        }

        if (schedule.calendar_type == 'HOLIDAY') {
            status = 'HOLIDAY'; // LIBUR
        }

        if (schedule.calendar_type == 'OFFDAY') {
            status = 'OFFDAY'; // GAK ADA JADWAL KERJA
        }

        if (actualIn && actualOut) {
            status = "PRESENT"; // HADIR

            if (actualIn > shiftInBase) {
                status = "LATE ARRIVAL"; // TELAT
                late = formatDuration(actualIn - shiftInBase);
            }

            if (actualOut < shiftOutBase) {
                early = formatDuration(shiftOutBase - actualOut);
            }
        }

        if (['ANNUAL LEAVE', 'UNPAID LEAVE', 'MEDICAL LEAVE', 'SPECIAL LEAVE', 'MATERNITY LEAVE'].includes(schedule.leave_type)) {
            status = 'LEAVE'; // CUTI FULLDAY
        }

        result.push({
            ...schedule,
            actual_in: actualIn ? formatDateTime(actualIn) : '',
            actual_out: actualOut ? formatDateTime(actualOut) : '',
            status: status,
            late: late,
            early: early
        });
    }

    return result;
}

// const scheduleList = $('Get List Schedule Working').first().json.data;
// const fingerList = $('Get List Raw Attendance').first().json.data;
// const result = ProcessAttendance(scheduleList, fingerList);

// return result;