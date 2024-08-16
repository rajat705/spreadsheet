import { useState } from "react";
import create from "zustand";
import produce from "immer";
import { FixedSizeGrid as Grid } from "react-window";

// Zustand store for state management
const useStore = create((set) => ({
  cells: Array(1000).fill("").map(() => Array(1000).fill("")),
  history: [],
  future: [],
  submittedData: [],
  searchTerm: "",
  updateCell: (row, col, value) => set((state) => {
    const newCells = produce(state.cells, draft => {
      draft[row][col] = value;
    });
    return {
      cells: newCells,
      history: [...state.history, state.cells],
      future: [],
    };
  }),
  undo: () => set((state) => {
    if (state.history.length === 0) return state;
    const previousCells = state.history[state.history.length - 1];
    return {
      cells: previousCells,
      history: state.history.slice(0, -1),
      future: [state.cells, ...state.future],
    };
  }),
  redo: () => set((state) => {
    if (state.future.length === 0) return state;
    const nextCells = state.future[0];
    return {
      cells: nextCells,
      history: [...state.history, state.cells],
      future: state.future.slice(1),
    };
  }),
  submit: (row, col, value) => set((state) => {
    const newCells = produce(state.cells, draft => {
      draft[row][col] = value;
    });
    return {
      cells: newCells,
      submittedData: [...state.submittedData, { row, col, value }],
    };
  }),
  setSearchTerm: (term) => set({ searchTerm: term }),
}));

// Cell Component
const Cell = ({ rowIndex, columnIndex, style }) => {
  const { cells, updateCell } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(cells[rowIndex][columnIndex]);

  const handleChange = (e) => setValue(e.target.value);

  const handleBlur = () => {
    updateCell(rowIndex, columnIndex, value);
    setIsEditing(false);
  };

  return (
    <div
      className={`cell ${rowIndex === 0 ? "cell-header" : ""}`}
      style={style}
      onClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus
          className="w-full h-full bg-transparent border-none outline-none"
        />
      ) : (
        value
      )}
    </div>
  );
};

// Spreadsheet Component
const Spreadsheet = () => {
  const { cells, undo, redo, submit, submittedData, searchTerm, setSearchTerm } = useStore();
  const [inputRow, setInputRow] = useState("");
  const [inputCol, setInputCol] = useState("");
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputRow && inputCol && inputValue) {
      submit(parseInt(inputRow), parseInt(inputCol), inputValue);
      setInputRow("");
      setInputCol("");
      setInputValue("");
    }
  };

  const filteredData = submittedData.filter((data) =>
    data.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">Spreadsheet</div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="form-group">
          <label htmlFor="row">Row:</label>
          <input
            id="row"
            type="number"
            value={inputRow}
            onChange={(e) => setInputRow(e.target.value)}
            className="input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="col">Column:</label>
          <input
            id="col"
            type="number"
            value={inputCol}
            onChange={(e) => setInputCol(e.target.value)}
            className="input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="value">Value:</label>
          <input
            id="value"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="input"
          />
        </div>
        <button type="submit" className="btn">Submit</button>
      </form>

      <input
        type="text"
        placeholder="Search..."
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input mb-4"
      />

      <Grid
        columnCount={1000}
        columnWidth={100}
        height={600}
        rowCount={1000}
        rowHeight={40}
        width={1000}
      >
        {Cell}
      </Grid>

      <div className="controls mt-4 flex justify-between">
        <button onClick={undo} className="btn">Undo</button>
        <button onClick={redo} className="btn">Redo</button>
      </div>

      <div className="submitted-data mt-4 p-4 bg-gray-200 rounded-lg">
        <h2 className="text-lg font-semibold">Submitted Data</h2>
        <ul>
          {filteredData.map((data, index) => (
            <li key={index}>
              Row {data.row}, Col {data.col}: {data.value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Spreadsheet;
