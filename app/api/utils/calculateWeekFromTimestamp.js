export const calculateWeekFromTimestamp = (joinedTimestamp) => {
  // const joinedTimestamp = "2023-11-02T19:12:24.000Z";
  
  const joinedDate = new Date(joinedTimestamp);
  joinedDate.setUTCHours(0, 0, 0, 0);  // Set to 12:00 AM UTC

  const currentDate = new Date();
  currentDate.setUTCHours(0, 0, 0, 0);  // Optional: Set to 12:00 AM UTC for consistency

  // Convert both dates to UTC for consistent calculations
  const joinedDateUTC = Date.UTC(joinedDate.getFullYear(), joinedDate.getMonth(), joinedDate.getDate());
  const currentDateUTC = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  // Calculate the number of days since the user's join date
  const daysSinceJoined = Math.floor((currentDateUTC - joinedDateUTC) / 86400000);

  // Calculate the total week number since the user's join date
  const totalWeeksSinceJoined = Math.ceil((daysSinceJoined + 1) / 7);

  // Calculate the user's current "year" based on 52-week years
  const userYear = Math.ceil(totalWeeksSinceJoined / 52);

  // Calculate the user's "week of year" within the current year cycle (1 to 52)
  const userWeekOfYear = ((totalWeeksSinceJoined - 1) % 52) + 1;

  // Calculate the user's "month of year" within the current year cycle (1 to 13, based on 4-week months)
  const userMonthOfYear = Math.ceil(userWeekOfYear / 4);

  // Set the start of the current week based on the user's join date (normalized to 12:00 AM UTC)
  const dayOfJoin = joinedDate.getUTCDay();
  const diff = joinedDate.getUTCDate() - dayOfJoin + (dayOfJoin === 0 ? -6 : 1);
  const startOfWeek = new Date(Date.UTC(joinedDate.getUTCFullYear(), joinedDate.getUTCMonth(), diff));

  return {
    yearsSinceJoined: userYear,            // User's year since join date, based on 52-week years
    weekNumber: userWeekOfYear, // User's week within the current 52-week year cycle
    monthsSinceJoined: userMonthOfYear, // User's month within the current year, based on 4-week months
    startOfWeek // The start of the current week based on the user's join date
  };
};


