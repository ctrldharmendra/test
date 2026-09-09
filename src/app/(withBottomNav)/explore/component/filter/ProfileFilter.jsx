"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  FaVenusMars,
  FaLocationDot,
  FaCakeCandles,
  FaChevronRight,
  FaCheck,
} from "react-icons/fa6";

import AppModal from "../ui/AppModal";
import WheelPicker from "../ui/WheelPicker";

import {
  setSelectedGender,
  setSelectedDistance,
  setSelectedAge,
} from "@/redux/slices/stateSlice";

const sexOptions = [
  {
    value: "",
    label: "Any",
    icon: "⚥",
    description: "Show all genders",
  },
  {
    value: "male",
    label: "Male",
    icon: "♂",
    description: "Show male profiles",
  },
  {
    value: "female",
    label: "Female",
    icon: "♀",
    description: "Show female profiles",
  },
  {
    value: "other",
    label: "Other",
    icon: "⚧",
    description: "Show other profiles",
  },
];

/*
 * Blank = default / no explicit distance selection.
 *
 * Actual API will treat blank distance as 10km.
 */
const distanceOptions = Array.from(
  { length: 100 },
  (_, index) => index + 1
);

/*
 * Blank = all ages.
 */
const ageOptions = Array.from(
  { length: 83 },
  (_, index) => index + 18
);

export default function ProfileFilters() {
  const dispatch = useDispatch();

  const [modal, setModal] = useState(null);

  /*
   * ============================
   * REDUX VALUES
   * ============================
   */

  const selectedAge = useSelector(
    (state) => state?.userState?.selectedAge
  );

  const selectedDistance = useSelector(
    (state) => state?.userState?.selectedDistance
  );

  const selectedGender = useSelector(
    (state) => state?.userState?.selectedGender
  );

  /*
   * ============================
   * TEMP VALUES
   * ============================
   */

  const [tempSex, setTempSex] = useState(
    selectedGender || ""
  );

  const [tempDistance, setTempDistance] = useState(
    selectedDistance || ""
  );

  const [tempAge, setTempAge] = useState(
    selectedAge || ""
  );

  /*
   * ============================
   * OPEN MODALS
   * ============================
   */

  const openSex = () => {
    setTempSex(selectedGender || "");
    setModal("sex");
  };

  const openDistance = () => {
    setTempDistance(selectedDistance || "");
    setModal("distance");
  };

  const openAge = () => {
    setTempAge(selectedAge || "");
    setModal("age");
  };

  const closeModal = () => {
    setModal(null);
  };

  /*
   * ============================
   * APPLY GENDER
   * ============================
   */

  const applySex = () => {
    dispatch(setSelectedGender(tempSex));

    console.log(
      "Selected gender:",
      tempSex || "ANY"
    );

    closeModal();
  };

  /*
   * ============================
   * APPLY DISTANCE
   * ============================
   */

  const applyDistance = () => {
    dispatch(setSelectedDistance(tempDistance));

    console.log(
      "Selected distance:",
      tempDistance
        ? `${tempDistance} km`
        : "DEFAULT 10 KM"
    );

    closeModal();
  };

  /*
   * ============================
   * APPLY AGE
   * ============================
   */

  const applyAge = () => {
    dispatch(setSelectedAge(tempAge));

    console.log(
      "Selected age:",
      tempAge || "ALL AGES"
    );

    closeModal();
  };

  return (
    <>
      {/* ================================================= */}
      {/* FILTER BUTTONS */}
      {/* ================================================= */}

      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">

        {/* ================================================= */}
        {/* GENDER */}
        {/* ================================================= */}

        <button
          onClick={openSex}
          className="
            flex shrink-0 items-center gap-2
            rounded-full
            border border-white/10
            bg-white/10
            px-4 py-2.5
            text-sm
            font-medium
            text-white
            backdrop-blur-xl
            transition
            active:scale-95
          "
        >
          <FaVenusMars className="text-white/60" />

          {selectedGender
            ? sexOptions.find(
                (item) =>
                  item.value === selectedGender
              )?.label
            : "Any"}

          <FaChevronRight
            className="
              ml-1
              text-[10px]
              text-white/40
            "
          />
        </button>

        {/* ================================================= */}
        {/* DISTANCE */}
        {/* ================================================= */}

        <button
          onClick={openDistance}
          className="
            flex shrink-0 items-center gap-2
            rounded-full
            border border-white/10
            bg-white/10
            px-4 py-2.5
            text-sm
            font-medium
            text-white
            backdrop-blur-xl
            transition
            active:scale-95
          "
        >
          <FaLocationDot className="text-white/60" />

          {selectedDistance
            ? `${selectedDistance} km`
            : "10 km"}

          <FaChevronRight
            className="
              ml-1
              text-[10px]
              text-white/40
            "
          />
        </button>

        {/* ================================================= */}
        {/* AGE */}
        {/* ================================================= */}

        <button
          onClick={openAge}
          className="
            flex shrink-0 items-center gap-2
            rounded-full
            border border-white/10
            bg-white/10
            px-4 py-2.5
            text-sm
            font-medium
            text-white
            backdrop-blur-xl
            transition
            active:scale-95
          "
        >
          <FaCakeCandles className="text-white/60" />

          {selectedAge
            ? selectedAge
            : "All ages"}

          <FaChevronRight
            className="
              ml-1
              text-[10px]
              text-white/40
            "
          />
        </button>
      </div>

      {/* ================================================= */}
      {/* GENDER MODAL */}
      {/* ================================================= */}

      <AppModal
        open={modal === "sex"}
        onClose={closeModal}
        title="I'm interested in"
      >
        <div className="space-y-3">

          {sexOptions.map((option) => {
            const selected =
              tempSex === option.value;

            return (
              <button
                key={option.value || "any"}
                onClick={() =>
                  setTempSex(option.value)
                }
                className={`
                  flex w-full items-center
                  rounded-2xl
                  border
                  px-4 py-4
                  text-left
                  transition
                  active:scale-[0.98]

                  ${
                    selected
                      ? "border-white/30 bg-white/10"
                      : "border-white/5 bg-white/[0.04]"
                  }
                `}
              >
                <span
                  className="
                    flex h-11 w-11
                    items-center justify-center
                    rounded-xl
                    bg-white/10
                    text-xl
                  "
                >
                  {option.icon}
                </span>

                <span className="ml-3 flex-1">

                  <span className="block text-sm font-semibold">
                    {option.label}
                  </span>

                  <span className="mt-0.5 block text-xs text-white/40">
                    {option.description}
                  </span>

                </span>

                {selected && (
                  <span
                    className="
                      flex h-7 w-7
                      items-center justify-center
                      rounded-full
                      bg-white
                      text-black
                    "
                  >
                    <FaCheck className="text-xs" />
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={applySex}
            className="
              mt-3 w-full
              rounded-2xl
              bg-white
              py-4
              text-sm
              font-bold
              text-black
              transition
              active:scale-[0.98]
            "
          >
            OK
          </button>
        </div>
      </AppModal>

      {/* ================================================= */}
      {/* DISTANCE MODAL */}
      {/* ================================================= */}

      <AppModal
        open={modal === "distance"}
        onClose={closeModal}
        title="Maximum distance"
      >
        <div className="py-3">

          <div className="mb-4 flex justify-center">
            <button
              onClick={() =>
                setTempDistance("")
              }
              className={`
                rounded-full
                border
                px-5 py-2.5
                text-sm
                font-semibold
                transition
                ${
                  tempDistance === ""
                    ? "border-white/30 bg-white text-black"
                    : "border-white/10 bg-white/5 text-white"
                }
              `}
            >
              Default — 10 km
            </button>
          </div>

          <WheelPicker
            values={distanceOptions}
            value={tempDistance || 10}
            onChange={setTempDistance}
            suffix="km"
          />

          <p className="mb-5 text-center text-xs text-white/40">
            {tempDistance
              ? `Show people within ${tempDistance} km`
              : "Default: show people within 10 km"}
          </p>

          <button
            onClick={applyDistance}
            className="
              w-full
              rounded-2xl
              bg-white
              py-4
              text-sm
              font-bold
              text-black
              transition
              active:scale-[0.98]
            "
          >
            OK
          </button>
        </div>
      </AppModal>

      {/* ================================================= */}
      {/* AGE MODAL */}
      {/* ================================================= */}

      <AppModal
        open={modal === "age"}
        onClose={closeModal}
        title="Age"
      >
        <div className="py-3">

          {/* ALL AGES */}

          <div className="mb-4 flex justify-center">
            <button
              onClick={() =>
                setTempAge("")
              }
              className={`
                rounded-full
                border
                px-5 py-2.5
                text-sm
                font-semibold
                transition

                ${
                  tempAge === ""
                    ? "border-white/30 bg-white text-black"
                    : "border-white/10 bg-white/5 text-white"
                }
              `}
            >
              All ages
            </button>
          </div>

          <WheelPicker
            values={ageOptions}
            value={tempAge || 25}
            onChange={setTempAge}
          />

          <p className="mb-5 text-center text-xs text-white/40">
            {tempAge
              ? `Show people aged ${tempAge}+`
              : "Show all ages"}
          </p>

          <button
            onClick={applyAge}
            className="
              w-full
              rounded-2xl
              bg-white
              py-4
              text-sm
              font-bold
              text-black
              transition
              active:scale-[0.98]
            "
          >
            OK
          </button>
        </div>
      </AppModal>
    </>
  );
}