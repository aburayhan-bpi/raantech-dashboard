export const getInitials = (fullName: string) => {
  if (!fullName) return "";
  const nameParts = fullName.trim().split(" ");
  const firstInitial = nameParts[0][0].toUpperCase();
  const lastName = nameParts[nameParts.length - 1];
  const lastInitials = lastName.slice(0, 2).toUpperCase(); // Take first two letters of last name
  return `${firstInitial} ${lastInitials}`;
  //   return `${firstInitial} ${lastInitials}`;
};
