export const removeEmptyStringProperties = (obj: any) => {
    return Object.entries(obj).reduce((newObj: any, [key, value]: any) => {
      if (typeof value === 'string' && value.length === 0) {
        newObj[key] = value;
      }
      return newObj;
    }, {});
  };
  
  