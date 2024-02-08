const fn = {
  getLocalStorage: function (key) {
    return localStorage.getItem(key);
  },
  setlocalStorage: function (key, data) {
    localStorage.setItem(key, data);
  },

  updateTodosStorage: function (data) {
    this.setlocalStorage("vuejstodos", JSON.stringify(data));
  },

  getTodosStorage: function () {
    const todos = this.getLocalStorage("vuejstodos");
    return todos === null ? [] : JSON.parse(todos);
  },
};

export default fn;
