export const SeatSelectorExtension = {
  name: 'SeatSelector',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_seatselector' ||
    trace.payload.name === 'ext_seatselector',
  render: ({ trace, element }) => {
    const { numberOfSeats = 0 } = trace.payload
    const seatSelectorContainer = document.createElement('div')

    seatSelectorContainer.innerHTML = `
      <style>
        .seat-selector {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .row {
          display: flex;
          gap: 10px;
        }
        .aisle {
          width: 20px;
        }
        .seat {
          width: 30px;
          height: 30px;
          border: 0.3px solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          border-radius: 5px;
          font-weight: bold;
        }
        .seat.selected {
          background-color: #2e6ee1;
          color: white;
        }
        .seat.occupied {
          background-color: #ccc;
          cursor: not-allowed;
          font-weight: normal;
        }
        .submit {
          background: linear-gradient(to right, #2e6ee1, #2e7ff1);
          border: none;
          color: white;
          padding: 10px;
          border-radius: 5px;
          width: 100%;
          cursor: pointer;
        }
        .submit:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      </style>
      <div class="seat-selector">
        ${generateSeats()}
      </div>
      <button class="submit" disabled>Confirm Seat Selection</button>
    `

    function generateSeats() {
      const rows = 10
      const seatsPerRow = 6
      let seatsHTML = ''
      for (let i = 0; i < rows; i++) {
        seatsHTML += '<div class="row">'
        for (let j = 0; j < seatsPerRow; j++) {
          if (j === 3) seatsHTML += '<div class="aisle"></div>'
          const seatNumber = `${i + 1}${String.fromCharCode(65 + j)}`
          const isOccupied = Math.random() < 0.3 // 30% chance of being occupied
          seatsHTML += `<div class="seat ${
            isOccupied ? 'occupied' : ''
          }" data-seat="${seatNumber}">${seatNumber}</div>`
        }
        seatsHTML += '</div>'
      }
      return seatsHTML
    }

    let selectedSeats = []
    const submitButton = seatSelectorContainer.querySelector('.submit')
    let isSubmitted = false

    function updateSubmitButton() {
      submitButton.disabled =
        selectedSeats.length !== numberOfSeats || isSubmitted
    }

    seatSelectorContainer.addEventListener('click', function (event) {
      if (
        !isSubmitted &&
        event.target.classList.contains('seat') &&
        !event.target.classList.contains('occupied')
      ) {
        if (event.target.classList.contains('selected')) {
          event.target.classList.remove('selected')
          selectedSeats = selectedSeats.filter(
            (seat) => seat !== event.target.dataset.seat
          )
        } else if (selectedSeats.length < numberOfSeats) {
          event.target.classList.add('selected')
          selectedSeats.push(event.target.dataset.seat)
        }
        updateSubmitButton()
      }
    })

    submitButton.addEventListener('click', function () {
      if (!isSubmitted) {
        isSubmitted = true
        updateSubmitButton()
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: { selectedSeats: selectedSeats },
        })
      }
    })

    updateSubmitButton()
    element.appendChild(seatSelectorContainer)
  },
}

/*
 This extension uses the seatchart.js library
 GitHub: https://github.com/omahili/seatchart.js
*/

export const SeatSelectorv2Extension = {
  name: 'SeatSelectorv2',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_seatselectorv2' ||
    trace.payload.name === 'ext_seatselectorv2',
  render: ({ trace, element }) => {
    const { numberOfSeats = 1, reservedSeats = [] } = trace.payload
    const seatSelectorContainer = document.createElement('div')
    console.log('Reserved seats:', reservedSeats)

    // Fetch and inject CSS
    fetch('https://cdn.jsdelivr.net/npm/seatchart@0.1.0/dist/seatchart.css')
      .then((response) => response.text())
      .then((css) => {
        const style = document.createElement('style')
        style.textContent = css
        seatSelectorContainer.appendChild(style)
      })

    // Create and append script
    const script = document.createElement('script')
    script.src =
      'https://cdn.jsdelivr.net/npm/seatchart@0.1.0/dist/seatchart.min.js'
    script.type = 'text/javascript'
    document.body.appendChild(script)

    seatSelectorContainer.innerHTML = `
     <style>

      .vfrc-message--extension-SeatSelectorv2 {
        background-color: transparent !important;
        background: none !important;
      }

      #container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        margin: 0;
        padding: 0;
        width: 275px;
        height: 600px;
        max-width: none;
        transform: scale(0.63);
        transform-origin: top left;
        overflow: visible;
        overflowX: hidden;
        overflowY: hidden;
      }

      .economy {
        color: white;
        background-color: #43aa8b;
      }

      .business {
        color: white;
        background-color: #277da1;
      }

      .premium {
        color: white;
        background-color: #f8961e;
      }

      .sc-seat {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 42px;
        width: 42px;
        margin: 4px;
        box-sizing: border-box;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        user-select: none;
        transition: all 0.1s ease-in-out;
      }

      .sc-seat.sc-seat-available:hover {
        cursor: pointer;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
      }

      .sc-seat.sc-seat-selected {
        cursor: pointer;
        background-color: black !important;
        color: white !important;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
      }

      .sc-seat.sc-seat-reserved,
      .sc-seat-reserved {
        color: white;
        background-color: #d2d2d2;
        cursor: not-allowed;
      }

      #buttonContainer {
        display: flex;
        gap: 10px;
        margin-top: 10px;
        transition: opacity 0.3s ease;
      }

      #submitButton, #cancelButton {
        font-size: 16px;
        border: none;
        color: white;
        padding: 10px;
        border-radius: 8px;
        cursor: pointer;
      }

      #submitButton {
        flex: 3;
        background: linear-gradient(to right, #2e6ee1, #2e7ff1);
      }

      #submitButton:hover:not(:disabled) {
        background: linear-gradient(to right, #2558b3, #2669c9);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      }

      #cancelButton {
        flex: 1;
        background: linear-gradient(to right, #ff9999, #ff9999);
      }

      #cancelButton:hover:not(:disabled) {
        background: #ff8080;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      }

      #submitButton:disabled, #cancelButton:disabled {
        background: #ccc;
        cursor: not-allowed;
        color: #666;
        box-shadow: none;
      }

    </style>
    <div id="container"></div>
    <div id="buttonContainer">
      <button id="submitButton">Confirm seat selection</button>
      <button id="cancelButton">Cancel</button>
    </div>`

    // Function to generate random reserved seats
    function generateRandomReservedSeats(totalRows, totalColumns, count) {
      const reservedSeats = []
      const totalSeats = totalRows * totalColumns
      const occupancyRate = 0.3 // 30% of seats will be reserved

      const numberOfReservedSeats = Math.floor(totalSeats * occupancyRate)

      while (reservedSeats.length < numberOfReservedSeats) {
        const row = Math.floor(Math.random() * totalRows)
        const col = Math.floor(Math.random() * totalColumns)
        const seat = { row, col }

        // Check if this seat is already reserved
        if (!reservedSeats.some((s) => s.row === row && s.col === col)) {
          reservedSeats.push(seat)
        }
      }

      return reservedSeats
    }

    // Function to translate reserved seats from seat labels to row and column indices
    function translateReservedSeats(seatLabels) {
      return seatLabels.map((label) => {
        const row = label.charCodeAt(0) - 65
        const col = parseInt(label.slice(1)) - 1
        return { row, col }
      })
    }

    var options = {
      cart: {
        visible: false,
      },
      legendVisible: false,
      map: {
        frontVisible: false,
        indexerColumns: {
          visible: false,
        },
        indexerRows: {
          visible: false,
        },
        rows: 15,
        columns: 7,
        seatTypes: {
          default: {
            label: 'Economy',
            cssClass: 'economy',
            price: 560,
            seatRows: [4, 5, 6, 8, 9, 10, 11, 13, 14],
          },
          first: {
            label: 'Business',
            cssClass: 'business',
            price: 2500,
            seatRows: [0, 1, 2],
          },
          premium: {
            label: 'Premuim',
            cssClass: 'premium',
            price: 680,
            seatColumns: [0, 6],
          },
        },
        disabledSeats: [
          { row: 0, col: 0 },
          { row: 0, col: 6 },
          { row: 14, col: 0 },
          { row: 14, col: 6 },
        ],
        // reservedSeats: translateReservedSeats(reservedSeats),
        reservedSeats: generateRandomReservedSeats(15, 7),
        /* reservedSeats: [
          { row: 0, col: 3 },
          { row: 0, col: 4 },
        ],
        selectedSeats: [{ row: 0, col: 5 }, { row: 0, col: 6 }],*/
        rowSpacers: [3, 7, 12],
        columnSpacers: [2, 5],
      },
    }

    // Wait for both CSS and JS to load before initializing Seatchart
    Promise.all([
      new Promise((resolve) => (script.onload = resolve)),
      fetch(
        'https://cdn.jsdelivr.net/npm/seatchart@0.1.0/dist/seatchart.css'
      ).then((res) => res.text()),
    ]).then(([_, css]) => {
      const style = document.createElement('style')
      style.textContent = css
      seatSelectorContainer.appendChild(style)

      var sc = new Seatchart(
        seatSelectorContainer.querySelector('#container'),
        options
      )

      const submitButton = seatSelectorContainer.querySelector('#submitButton')
      submitButton.disabled = true // Disable button by default
      const cancelButton = seatSelectorContainer.querySelector('#cancelButton')

      let isSubmitted = false

      // Function to update button state and text
      const updateButtonState = () => {
        const selectedSeats = sc.getCart()
        submitButton.disabled =
          selectedSeats.length !== numberOfSeats || isSubmitted
        const buttonContainer =
          seatSelectorContainer.querySelector('#buttonContainer')

        if (isSubmitted) {
          buttonContainer.style.opacity = '0'
          buttonContainer.style.pointerEvents = 'none'
        } else {
          buttonContainer.style.opacity = '1'
          buttonContainer.style.pointerEvents = 'auto'

          if (numberOfSeats === 1) {
            submitButton.textContent = 'Confirm seat selection'
          } else {
            const remainingSeats = numberOfSeats - selectedSeats.length
            if (remainingSeats > 0) {
              submitButton.textContent = `Select ${remainingSeats} more seat${
                remainingSeats !== 1 ? 's' : ''
              }`
            } else {
              submitButton.textContent = 'Confirm seats selection'
            }
          }
        }
      }

      // Add event listener for seat changes
      sc.addEventListener('seatchange', (event) => {
        // console.log('Seat change event:', event)
        updateButtonState()
      })

      // Initial button state update
      updateButtonState()

      // Create a mapping for seat type labels
      const seatTypeLabels = {
        default: 'Economy',
        first: 'Business',
        premium: 'Premium',
      }

      cancelButton.addEventListener('click', function () {
        if (isSubmitted) return

        isSubmitted = true
        updateButtonState()

        // Disable selector and buttons
        seatSelectorContainer.querySelector('#container').style.pointerEvents =
          'none'
        seatSelectorContainer.querySelector('#container').style.opacity = '0.7'

        window.voiceflow.chat.interact({ type: 'canceled' })
      })

      submitButton.addEventListener('click', function () {
        submitButton.textContent = ''
        if (isSubmitted) return

        isSubmitted = true
        updateButtonState()

        var selectedSeats = sc.getCart()
        var total = selectedSeats.reduce((sum, seat) => {
          var seatType = options.map.seatTypes[seat.type]
          return sum + seatType.price
        }, 0)

        // Function to get seat label from Seatchart
        const getSeatLabel = (row, col) => {
          const seatInfo = sc.getSeat({ row, col })
          return seatInfo.label || `${row + 1}${String.fromCharCode(65 + col)}`
        }

        // Function to get the correct seat type label
        const getSeatTypeLabel = (type) => {
          return seatTypeLabels[type] || type
        }

        // Prepare payload
        const payload = {
          selectedSeats: selectedSeats.map((seat) => ({
            label: getSeatLabel(seat.index.row, seat.index.col),
            type: getSeatTypeLabel(seat.type),
            price: options.map.seatTypes[seat.type].price,
          })),
          totalPrice: total,
        }

        // Submit to interact
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: payload,
        })

        // Disable selector and button
        isSubmitted = true
        updateButtonState()

        // Disable the container
        seatSelectorContainer.querySelector('#container').style.pointerEvents =
          'none'
        seatSelectorContainer.querySelector('#container').style.opacity = '0.7'

        console.log('Submitted seats:', payload)
      })
    })
    element.appendChild(seatSelectorContainer)
  },
}
