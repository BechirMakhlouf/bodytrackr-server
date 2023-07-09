import { Weight } from "../models/userInfoModel.js";

function compareDates(firstDate: Date, secondDate: Date): boolean {
  const firstDateInfo = {
    year: firstDate.getFullYear(),
    month: firstDate.getMonth(),
    day: firstDate.getDay(),
  };

  const secondDateInfo = {
    year: secondDate.getFullYear(),
    month: secondDate.getMonth(),
    day: secondDate.getDay(),
  };

  if (firstDateInfo.year > secondDateInfo.year) {
    return true;
  } else if (firstDateInfo.year < secondDateInfo.year) {
    return false;
  }

  if (firstDateInfo.month > secondDateInfo.month) {
    return true;
  } else if (firstDateInfo.month < secondDateInfo.month) {
    return false;
  }

  if (firstDateInfo.day > secondDateInfo.day) {
    return true;
  } else {
    return false;
  }
}

function sortWeightLog(weightLog: Weight[]): void {
  weightLog.sort((a, b) => compareDates(a.date, b.date) ? 1 : -1);
}

function parseWeightLogSent(
  weightLogSent: { weightKg: number; date: string }[],
): Weight[] {
  const weightLog = weightLogSent.map(
    function (weight: { weightKg: number; date: string }) {
      const date: Date = new Date(weight.date);
      date.setHours(0, 0, 0, 0);

      return {
        weightKg: Number(weight.weightKg),
        date: date,
      };
    },
  );

  return weightLog;
}

export { compareDates, parseWeightLogSent, sortWeightLog };
