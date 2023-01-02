function moveMouse(x, y, amount, steps) {
  let currentX = x;
  const amountMovedPerStep = amount / steps;
  const moveInterval = setInterval(() => {
    console.log({currentX})
    currentX += amountMovedPerStep;
    if (currentX > amount) {
      clearInterval(moveInterval);
      console.log('moving done')
    }
  }, 1)
}

moveMouse(100, 0, 1000, 5000);