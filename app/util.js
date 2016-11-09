module.exports = {
  getIndexOfLargest: function(arr) {
    if (!arr) return -1;
    var largest = arr[0];
    var largesti = 0;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] > arr[largesti]) {
        largest = arr[i];
        largesti = i;
      }
    }
    return largesti;
  }
}