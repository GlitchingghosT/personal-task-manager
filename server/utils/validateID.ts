// utils is the short for utilities which refers to a collection of helper functions or modules designed to perform common tasks on multiple functions.

// These tasks often includes things like data validation, formatting or other repetitive operations that are used across different parts of the application.

import mongoose from "mongoose";

// a function that checks if the id is a valid mongodb objectid
export const validateID = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};
