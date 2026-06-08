export const isDateOnOrAfterToday = (value: Date) => {
  const date = new Date(value);
  const today = new Date();

  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return date >= today;
};

export const isOpportunityExpired = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return !isDateOnOrAfterToday(date);
};

export const compareOpportunityDeadlineAsc = <
  T extends { dateEnd: Date | string },
>(
  first: T,
  second: T,
) => {
  const firstExpired = isOpportunityExpired(first.dateEnd);
  const secondExpired = isOpportunityExpired(second.dateEnd);

  if (firstExpired !== secondExpired) {
    return firstExpired ? 1 : -1;
  }

  return new Date(first.dateEnd).getTime() - new Date(second.dateEnd).getTime();
};

export const formatOpportunityDateForApi = (value: Date | string) => {
  if (typeof value === "string") {
    return value.includes("T") ? value.slice(0, 10) : value;
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
