import { useState, useEffect } from "react";

/** Custom hook for keeping state data synced with localStorage.
 */

function useLocalStorage(key, firstValue = null) {
  const initialValue = JSON.parse(localStorage.getItem(key)) || firstValue;
  const [item, setItem] = useState(initialValue);

  useEffect(
    function setKeyInLocalStorage() {

      if (item === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(item));
      }
    },
    [key, item]
  );

  return [item, setItem];
}

export default useLocalStorage;
