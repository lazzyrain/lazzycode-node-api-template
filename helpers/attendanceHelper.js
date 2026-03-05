const formatDuration = (ms) => {
    if (ms <= 0) return "00:00";

    const totalMinutes = Math.floor(ms / 60000);
    const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const mm = String(totalMinutes % 60).padStart(2, '0');

    return `${hh}:${mm}`;
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
        const baseDate = schedule.schedule_date;

        const shiftInBase = new Date(`${schedule.attendance_in}`);
        let shiftOutBase = new Date(`${schedule.attendance_out}`);

        const before = 4 * 3600 * 1000;
        const after = 8 * 3600 * 1000;

        const windowInStart = new Date(shiftInBase.getTime() - before);
        const windowInEnd = shiftOutBase;
        const windowOutStart = shiftInBase;
        let windowOutEnd = new Date(shiftOutBase.getTime() + after);

        const hasOvertimeCallback = (schedule.overtime_callback_from &&
            schedule.overtime_callback_to &&
            schedule.overtime_callback_total_hour);
        let overtimeCallbackFrom;
        let overtimeCallbackTo;
        if (hasOvertimeCallback) {
            overtimeCallbackFrom = new Date(
                `${schedule.schedule_date} ${schedule.overtime_callback_from}`
            );
            overtimeCallbackTo = new Date(
                `${schedule.schedule_date} ${schedule.overtime_callback_to}`
            );

            // kalau callback lebih kecil dari attendance_in
            // berarti callback ada di hari setelah attendance_out
            if (overtimeCallbackFrom <= shiftInBase) {
                overtimeCallbackFrom.setDate(overtimeCallbackFrom.getDate() + 1);
            }
            if (overtimeCallbackTo <= overtimeCallbackFrom) {
                overtimeCallbackTo.setDate(overtimeCallbackTo.getDate() + 1);
            }

            // windowOutEnd maksimal sebelum overtime_callback_from
            if (overtimeCallbackFrom < windowOutEnd) {
                windowOutEnd = overtimeCallbackFrom;
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

        let resultOvertimeCallback = {
            overtime_callback_actual_in: '',
            overtime_callback_actual_out: '',
            overtime_callback_status: '',
            overtime_callback_late: '',
            overtime_callback_early: ''
        };
        if (hasOvertimeCallback) {
            resultOvertimeCallback = await ProcessOvertimeCallback(fingers, overtimeCallbackFrom, overtimeCallbackTo);
        }

        result.push({
            ...schedule,
            actual_in: actualIn ? formatDateTime(actualIn) : '',
            actual_out: actualOut ? formatDateTime(actualOut) : '',
            status: status,
            late: late,
            early: early,
            ...resultOvertimeCallback
        });
    }

    return result;
}

const ProcessOvertimeCallback = async (fingers, overtimeCallbackFrom, overtimeCallbackTo) => {
    const overtimeCallbackBefore = 1 * 3600 * 1000;
    const overtimeCallbackBeforeAfter = 8 * 3600 * 1000;
    const windowOvertimeCallbackInStart = new Date(overtimeCallbackFrom.getTime() - overtimeCallbackBefore);
    const windowOvertimeCallbackInEnd = overtimeCallbackTo;
    const windowOvertimeCallbackOutStart = new Date(overtimeCallbackFrom);
    const windowOvertimeCallbackOutEnd = new Date(overtimeCallbackTo.getTime() + overtimeCallbackBeforeAfter);

    let actualIn = null;
    let actualOut = null;

    for (const finger of fingers) {
        const fingerTime = finger.time;

        if (
            finger.type === "I" &&
            !actualIn &&
            fingerTime >= windowOvertimeCallbackInStart &&
            fingerTime <= windowOvertimeCallbackInEnd
        ) {
            actualIn = fingerTime;
        }

        if (
            finger.type === "O" &&
            !actualOut &&
            fingerTime >= windowOvertimeCallbackOutStart &&
            fingerTime <= windowOvertimeCallbackOutEnd
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

    if ((overtimeCallbackFrom && overtimeCallbackTo) && (!actualIn && !actualOut)) {
        status = "ABSENT"; // TIDAK HADIR
    }

    if (actualIn && actualOut) {
        status = "PRESENT"; // HADIR

        if (actualIn > overtimeCallbackFrom) {
            status = "LATE ARRIVAL"; // TELAT
            late = formatDuration(actualIn - overtimeCallbackFrom);
        }

        if (actualOut < overtimeCallbackTo) {
            early = formatDuration(overtimeCallbackTo - actualOut);
        }
    }

    return {
        overtime_callback_from: overtimeCallbackFrom ? formatDateTime(overtimeCallbackFrom) : '',
        overtime_callback_to: overtimeCallbackTo ? formatDateTime(overtimeCallbackTo) : '',
        overtime_callback_actual_in: actualIn ? formatDateTime(actualIn) : '',
        overtime_callback_actual_out: actualOut ? formatDateTime(actualOut) : '',
        overtime_callback_status: status,
        overtime_callback_late: late,
        overtime_callback_early: early
    };
}

// const scheduleList = $('Get List Schedule Working').first().json.data;
// const fingerList = $('Get List Raw Attendance').first().json.data;
// const result = ProcessAttendance(scheduleList, fingerList);

// return result;