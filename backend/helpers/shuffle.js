const shuffle = (array) => {
  let counter = array.length;

  while (counter > 0) {
    let randIdx = Math.floor(Math.random() * counter);
    counter--;

    [array[counter], array[randIdx]] = [array[randIdx], array[counter]];
  }

  return array;
};


module.exports = { shuffle };