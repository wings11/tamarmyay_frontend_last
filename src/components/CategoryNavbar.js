import React from "react";
import { useNavigate } from "react-router-dom";

function CategoryNavbar({
  categories,
  selectedCategory,
  isFormValid,
  setSelectedCategory,
}) {
  const navigate = useNavigate();
  return (
    <nav
      className="w-full bg-[#FFFCF1] border-r-1 border-black fixed top-0 left-0 bottom-0 "
      style={{ opacity: isFormValid ? 1 : 0.5 }}
    >
      <img
        src="https://res.cloudinary.com/dnoitugnb/image/upload/v1746340828/tmylogo.png"
        alt="Logo"
        className="w-full md:max-w-[300px] mt-16 mb-16"
        onClick={() => navigate("/")}
      />
      <ul className="flex flex-col items-center gap-5 p-0">
        {categories.map((cat) => (
          <li key={cat}>
            <button
              type="button"
              className={`w-[144px] h-[35px] rounded-md text-md font-medium transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-[#e4d4af] text-black border-gray-700"
                  : "bg-[#FFFCF1] text-black border-gray-500 hover:bg-[#ede7d3]"
              } ${isFormValid ? "cursor-pointer" : "cursor-not-allowed"}`}
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
