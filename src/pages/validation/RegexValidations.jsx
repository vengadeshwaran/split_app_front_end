export const RegexValidations = {
  // Basic text
  onlyAlphabet: /^[A-Za-z\s]+$/, // Alphabets + space
  alphanumeric: /^[A-Za-z0-9\s]+$/, // Letters + numbers + space
  alphanumericNoSpace: /^[A-Za-z0-9]+$/, // Letters + numbers (no spaces)
  idNumber: /^[A-Za-z0-9-]+$/, // Letters + numbers + hyphen
  username: /^(?!.*__)[A-Za-z0-9](?:[A-Za-z0-9_]{1,28}[A-Za-z0-9])?$/, // Username format (no consecutive "__")

  // Numbers
  onlyNumber: /^\d+$/, // Integer only
  positiveInteger: /^\d+$/, // same as above (can remove one)
  numberWithDecimal: /^\d+(\.\d+)?$/, // number or decimal
  floatingPointNumber: /^-?\d*\.?\d*$/, // optional negative and decimal
  percentage: /^\d+(\.\d+)?%$/, // e.g., 45 or 45.5%
  allownumberhyphens: /^[0-9 -]+$/, // digits + space + hyphen

  // Names & Text patterns
  name: /^[A-Za-z]+(?:\s[A-Za-z]+)*$/, // single or multiple names (1 space max)
  allowPattern: /^[A-Za-z\s'-]+$/, // alphabets + space + hyphen + apostrophe
  allowAlphaHyphens: /^[A-Za-z -]+$/, // alphabets + space + hyphen
  address: /^[A-Za-z0-9\s,.'-]+$/, // typical address

  // Email
  email: /^[a-zA-Z0-9._-]{3,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/,
  emailStrict: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/,

  // Passwords
  password: /^[a-zA-Z0-9@#$%^&*!_.\-]*$/,

  // Space controls
  noSpaces: /^\S+$/, // disallow any space
  notAllowConsecutiveSpaces: /^(?!.*\s{2}).*$/, // no double spaces

  // Emoji restrict
  emojiRestrict:
    /[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA00}-\u{1FA6F}|\u{1FA70}-\u{1FAFF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu,
};
