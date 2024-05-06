export const filterObject = (obj: any, getFields: Array<string>) => {
  const newObj: any = {};
  Object.keys(obj).forEach((key) => {
    if (getFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};
