const table = document.querySelector('#app table')

let stepCount = 1
const circlePosition = []
const crossPosition = []
const validPosition = getInitialValidPosition()
const winCondition = [
  row(1), // [1,2,3]
  row(2), // [4,5,6]
  row(3), // [7,8,9]
  column(1), // [1,4,7]
  column(2), // [2,5,8]
  column(3), // [3,6,9]
  [1, 5, 9],
  [3, 5, 7]
]

function getInitialValidPosition() {
  const allTdInApp = document.querySelectorAll('#app table tr td')
  // console.log(allTdInApp)
  const copiedAllTdInApp = [...allTdInApp]
  // console.log(copiedAllTdInApp)

  const validPosition = copiedAllTdInApp.map(td => {
    // console.log(parseInt(td.dataset.index))
    return parseInt(td.dataset.index)
  })

  return validPosition
}

function row(number) {
  return [(3 * number) - 2, (3 * number) - 1, 3 * number]
}

function column(number) {
  return [number, number + 3, number + 6]
}

// v2的draw()
function draw_2(positionIndex, shape) {
  if (shape !== 'circle' && shape !== 'cross') {
    return
  }

  const allTdInApp = document.querySelectorAll('#app table tr td')
  const copiedAllTdInApp = [...allTdInApp]
  const position = copiedAllTdInApp.find(td => positionIndex === parseInt(td.dataset.index))

  position.innerHTML = `<div class="${shape}"></div>`
}

// v2的pushPosition()
function pushPosition_2(positionIndex) {
  const data = stepCount % 2 ? circlePosition : crossPosition // 1 || 0 ?
  data.push(positionIndex)
  // console.log(`${stepCount % 2 ? 'circlePosition' : 'crossPosition'}:`, data)
}

// v2的resetValidPosition()
function resetValidPosition_2(positionIndex) {
  const removeIndex = validPosition.findIndex(eachPosition => positionIndex === eachPosition)
  validPosition.splice(removeIndex, 1)
  // console.log('validPosition(還可以下的位置):', validPosition)
}

// v2的hasWinner()
function hasWinner_2(positionArr) {
  const isWin = winCondition.some(eachCondition => {
    if (eachCondition.every(eachPosition => positionArr.includes(eachPosition))) {
      return true
    }
  })

  return isWin
}

function getComputerPosition() {
  // 設計一個演算法，最終會回傳一個最適位置，給computerMove用
  if (stepCount % 2 !== 0) {
    return
  }

  const copiedCrossPosition = structuredClone(crossPosition)
  const copiedCirclePosition = structuredClone(circlePosition)

  // 如果電腦下了這個位置就贏，電腦下這個位置
  const positionWin = validPosition.find(eachPosition => {
    copiedCrossPosition.push(eachPosition)
    // console.log('copiedCrossPosition after push:', copiedCrossPosition)

    const isCrossWin = hasWinner_2(copiedCrossPosition)
    if (isCrossWin) {
      return true
    }

    copiedCrossPosition.pop()
    // console.log('copiedCrossPosition after pop:', copiedCrossPosition)
  })

  if (positionWin !== undefined) {
    return positionWin
  }

  // 如果玩家下了這個位置就贏，電腦下這個位置
  const positionDefend = validPosition.find(eachPosition => {
    copiedCirclePosition.push(eachPosition)
    // console.log('copiedCirclePosition after push:', copiedCirclePosition)

    if (hasWinner_2(copiedCirclePosition)) {
      return true
    }

    copiedCirclePosition.pop()
    // console.log('copiedCirclePosition after pop:', copiedCirclePosition)
  })

  if (positionDefend !== undefined) {
    return positionDefend
  }

  // 如果中間還沒下，電腦就下
  const middleTd = [...document.querySelectorAll('#app table tr td')][4]
  const positionMiddle = parseInt(middleTd.dataset.index)

  if (validPosition.some(eachPosition => positionMiddle === eachPosition)) {
    return positionMiddle
  }

  // 如果鄰近可以下，電腦就下
  // 這個似乎解不出來.......
  // 可能可以做一個判斷，該格代表的數字除以3，得到的商 + 1和餘數分別代表那個格子是第幾行(row)第幾列(column)
  // 再來再根據第幾行第幾列去判斷'鄰近域'是什麼型態，角格、邊格、內格的鄰近域的型態都不同
  // 再來就是比對鄰近域有沒有被下過了，沒有的話就從可以下的鄰近域中隨機選一個下，都有下過就找下一個自己下過的格子，持續到找完自己下過的所有格子
  // 所有的自己下過的格子找完，如果所有的鄰近域都沒有可以下的地方（可能被自己或敵人下過了），那就可以隨機下了
  // 鄰近的這個part在棋盤大於3*3可能比較有加上這個功能的意義，3*3的棋盤加這一個功能意義不大

  // 隨機下剩下可以下的位置
  const positionRandom = validPosition[Math.floor(Math.random() * validPosition.length)]
  // console.log('positionRandom:', positionRandom)

  return positionRandom
}

function computerMove(positionIndex) {
  // 輪到電腦才執行此函式
  if (stepCount % 2 !== 0) {
    return
  }

  // 電腦下棋
  draw_2(positionIndex, 'cross')

  // 把電腦下好的位置紀錄
  pushPosition_2(positionIndex)

  // 更新validPosition
  resetValidPosition_2(positionIndex)

  // 判斷電腦是否勝利
  if (hasWinner_2(crossPosition)) {
    setTimeout(() => {
      alert('cross win')
    }, 100)

    table.removeEventListener('click', onTableClicked)

    return
  }

  stepCount++
}

function onTableClicked(event) {
  // 點錯位置就強制return
  if (event.target.tagName.toLowerCase() !== 'td') {
    return
  }

  // 阻擋畫過的格子的重複點擊
  if (event.target.tagName.toLowerCase() === 'td' && event.target.firstElementChild) {
    return
  }

  // 如果不是玩家的回合強制return
  if (stepCount % 2 !== 1) {
    return
  }

  const positionIndex = parseInt(event.target.dataset.index)

  // 玩家點擊的地方畫圈
  draw_2(positionIndex, 'circle')

  // 記錄玩家的下棋位置
  pushPosition_2(positionIndex)

  // 從validPosition splice掉玩家點擊的position
  resetValidPosition_2(positionIndex)

  // 判斷玩家是否勝利
  if (hasWinner_2(circlePosition)) {
    setTimeout(() => {
      alert('circle win')
    }, 100)

    table.removeEventListener('click', onTableClicked)

    return
  }

  // 判斷是否和局
  if (!validPosition.length) {
    setTimeout(() => {
      alert('平手')
    }, 100)

    table.removeEventListener('click', onTableClicked)

    return
  }

  stepCount++

  // 輪到電腦的回合
  computerMove(getComputerPosition())
}

table.addEventListener('click', onTableClicked)

