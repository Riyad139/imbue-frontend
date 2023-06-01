/* eslint-disable react/display-name */
import { arrowDownIcon } from "@/assets/svgs";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import BriefFilter from "./BriefFilter";
import { BriefFilterOption, FilterOption } from "@/types/briefTypes";
import { FreelancerFilterOption } from "@/types/freelancerTypes";

interface CustomDropDownProps {
  name: string;
  filterType: BriefFilterOption | FreelancerFilterOption;
  filterOptions: Array<FilterOption> | undefined | any;
  setId?: (id: string | string[]) => void;
  ids?: Array<string>;
}

const CustomDropDown = React.memo(
  ({
    name,
    filterType,
    filterOptions,
    setId,
    ids,
  }: CustomDropDownProps): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
      const storedState = localStorage.getItem(name);

      if (storedState === "true") {
        setIsOpen(true);
      }
    }, [name]);

    const handleToggle = () => {
      if (isOpen) {
        localStorage.setItem(name, "false");
      } else {
        localStorage.setItem(name, "true");
      }

      setIsOpen(!isOpen);
    };

    return (
      <div className="relative md:mb-8 mb-4">
        <div
          onClick={handleToggle}
          typeof="button"
          className="h-[39px] w-full border border-[#EBEAE2] rounded-xl flex justify-between items-center text-white font-normal text-sm p-3 cursor-pointer"
        >
          {name}
          <Image
            src={arrowDownIcon}
            alt={"filter-icon"}
            className="h-[12px] w-[12px]"
          />
        </div>
        {isOpen && (
          <div className="w-[221px] bg-[#1B1B1B] p-4 rounded-[10px] z-50 absolute transition-all duration-300 ease-in-out">
            <BriefFilter
              label=""
              filter_type={filterType}
              filter_options={filterOptions}
              setId={setId}
              ids={ids}
            />
          </div>
        )}
      </div>
    );
  }
);

export default CustomDropDown;