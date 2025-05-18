import React from "react";

function CategoryNavbar({
  categories,
  selectedCategory,
  isFormValid,
  setSelectedCategory,
}) {
  return (
    <nav style={{ marginBottom: "20px", opacity: isFormValid ? 1 : 0.5 }}>
      <ul
        style={{
          listStyle: "none",
          display: "flex",
          gap: "10px",
          padding: 0,
          flexWrap: "wrap",
        }}
      >
        {categories.map((cat) => (
          <li key={cat}>
            <button
              type="button"
              style={{
                padding: "10px",
                background: selectedCategory === cat ? "#007bff" : "#f8f9fa",
                color: selectedCategory === cat ? "#fff" : "#000",
                border: "none",
                cursor: isFormValid ? "pointer" : "not-allowed",
                borderRadius: "5px",
              }}
              onClick={() => isFormValid && setSelectedCategory(cat)}
              disabled={!isFormValid}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default CategoryNavbar;
