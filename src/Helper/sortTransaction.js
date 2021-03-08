const sortTransaction = (obj) => {
  return Object.assign(
    ...Object.entries(obj)
      .sort(function (a, b) {
        return obj[a[0]].index - obj[b[0]].index;
      })
      .map(([key, value]) => {
        return {
          [key]: value,
        };
      }),
  );
};

export default sortTransaction;
