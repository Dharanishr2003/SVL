import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import "./LeadsPage.css";
import "./RequirementFormModal.css";
import { createRequirement, updateRequirement } from "../../api/requirementApi";

/* ───────── product field configs by type name ───────── */
const BOX_PACKAGING_FIELDS = [
  { key: "lengthCm", label: "Length (cm)", type: "number" },
  { key: "widthCm", label: "Width (cm)", type: "number" },
  { key: "heightCm", label: "Height (cm)", type: "number" },
  { key: "loadCapacityKg", label: "Load Capacity (kg)", type: "number" },
  { key: "boxStyle", label: "Box Style", type: "select", options: ["RSC", "Die-cut", "Mailer", "Flap"] },
  { key: "ply", label: "Ply", type: "select", options: ["Single", "3", "5", "7"] },
  { key: "fluteType", label: "Flute Type", type: "select", options: ["E", "B", "C", "BC"] },
  { key: "boardGsm", label: "Board GSM", type: "text", placeholder: "e.g. 150, 200, 300" },
  { key: "printingMethod", label: "Printing Method", type: "select", options: ["Flexo", "Offset", "Digital"] },
  { key: "printColours", label: "Print Colours", type: "select", options: ["Plain", "1 colour", "2 colour", "CMYK"] },
  { key: "finish", label: "Finish", type: "select", options: ["Matte", "Glossy", "UV", "Emboss"] },
  { key: "usageType", label: "Usage Type", type: "select", options: ["Food", "Retail", "E-commerce", "Industrial"] },
  { key: "addons", label: "Add-ons", type: "text", placeholder: "e.g. Partition, Handle, Window" },
  { key: "dielineAvailable", label: "Dieline Available", type: "select", options: ["Yes", "No"] },
  { key: "foodSafe", label: "Food Safe", type: "select", options: ["Yes", "No"] },
  { key: "greaseProof", label: "Grease Proof", type: "select", options: ["Yes", "No"] },
];

const FOOD_CUP_FIELDS = [
  { key: "capacityMl", label: "Capacity (ml)", type: "number" },
  { key: "material", label: "Material", type: "select", options: ["Paper", "Plastic", "Bagasse"] },
  { key: "gsm", label: "GSM", type: "text" },
  { key: "printingMethod", label: "Printing Method", type: "select", options: ["Screen", "Digital", "Flexo", "Offset"] },
  { key: "printType", label: "Print Type", type: "select", options: ["Single colour", "Multicolour"] },
  { key: "lamination", label: "Lamination", type: "select", options: ["None", "Matte", "Glossy"] },
  { key: "lidType", label: "Lid Type", type: "select", options: ["Flat", "Dome", "Spout"] },
  { key: "foodSafe", label: "Food Safe", type: "select", options: ["Yes", "No"] },
  { key: "leakProof", label: "Leak Proof", type: "select", options: ["Yes", "No"] },
];

const WRAP_FIELDS = [
  { key: "size", label: "Size (mm/cm)", type: "text", placeholder: "e.g. 200 x 150 mm" },
  { key: "material", label: "Material", type: "select", options: ["Butter paper", "Foil", "Paper"] },
  { key: "gsm", label: "GSM", type: "text" },
  { key: "printing", label: "Printing", type: "select", options: ["Yes", "No"] },
  { key: "foodSafe", label: "Food Safe", type: "select", options: ["Yes", "No"] },
  { key: "greaseProof", label: "Grease Proof", type: "select", options: ["Yes", "No"] },
];

const ACCESSORY_FIELDS = [
  { key: "material", label: "Material", type: "select", options: ["Wood", "Plastic"] },
  { key: "size", label: "Size", type: "text" },
  { key: "accessoryType", label: "Type", type: "select", options: ["Disposable", "Re-usable"] },
  { key: "foodGrade", label: "Food Grade", type: "select", options: ["Yes", "No"] },
];

const WOOD_PLASTIC_SPOON_FIELDS = [
  { key: "type", label: "Type", type: "select", options: ["Wood", "Plastic"] },
  { key: "size", label: "Size", type: "text", placeholder: "Custom size" },
];

const ICE_CREAM_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "length", label: "Length (Size)", type: "text", placeholder: "Custom" },
  { key: "width", label: "Width (Size)", type: "text", placeholder: "Custom" },
  { key: "height", label: "Height (Size)", type: "text", placeholder: "Custom" },
  { key: "gsm", label: "Gsm", type: "text", placeholder: "Custom" },
  { key: "lamination", label: "Lamination", type: "select", options: ["Matt", "Gloss"] },
  { key: "boxOuterType", label: "Box Outer Type", type: "select", options: ["White", "Readymade Box"] },
];

const MONOCOTTON_BOX_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "length", label: "Length (Size)", type: "text", placeholder: "Custom" },
  { key: "width", label: "Width (Size)", type: "text", placeholder: "Custom" },
  { key: "height", label: "Height (Size)", type: "text", placeholder: "Custom" },
  { key: "gsm", label: "Gsm", type: "text", placeholder: "Custom" },
  { key: "lamination", label: "Lamination", type: "select", options: ["Matt", "Glossy"] },
];

const BRANDING_BOX_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "length", label: "Length (Size)", type: "text", placeholder: "Custom" },
  { key: "width", label: "Width (Size)", type: "text", placeholder: "Custom" },
  { key: "height", label: "Height (Size)", type: "text", placeholder: "Custom" },
  { key: "gsm", label: "Gsm", type: "text", placeholder: "Custom" },
  { key: "lamination", label: "Lamination", type: "select", options: ["Matt", "Glossy"] },
];

const PLAIN_CUSTOMIZED_BOX_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "length", label: "Length (Size)", type: "text", placeholder: "Custom" },
  { key: "width", label: "Width (Size)", type: "text", placeholder: "Custom" },
  { key: "height", label: "Height (Size)", type: "text", placeholder: "Custom" },
  { key: "gsm", label: "Gsm", type: "text", placeholder: "Custom" },
  { key: "lamination", label: "Lamination", type: "select", options: ["Matt", "Glossy"] },
];

const FLEX_PRINTING_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["Small (2×1 ft)", "Medium (4×2 ft)", "Large (6×3 ft)", "Extra Large (8×4 ft)", "Custom"], allowCustom: true },
  { key: "customWidth", label: "Width (ft)", type: "number", hidden: true },
  { key: "customHeight", label: "Height (ft)", type: "number", hidden: true },
  { key: "orientation", label: "Orientation", type: "select", options: ["Horizontal", "Vertical"] },
  { key: "required", label: "Required", type: "select", options: ["Flex Only", "Flex with Frame"] },
];

const FLEX_WITH_COLOUR_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["Small (2×1 ft)", "Medium (4×2 ft)", "Large (6×3 ft)", "Extra Large (8×4 ft)", "Custom"], allowCustom: true },
  { key: "customWidth", label: "Width (ft)", type: "number", hidden: true },
  { key: "customHeight", label: "Height (ft)", type: "number", hidden: true },
  { key: "orientation", label: "Orientation", type: "select", options: ["Horizontal", "Vertical"] },
  { key: "required", label: "Required", type: "select", options: ["Flex Only", "Flex with Frame"] },
  { key: "colour", label: "Colour", type: "select", options: ["Red", "Blue", "Green", "Yellow", "Custom"], allowCustom: true, customPlaceholder: "Enter custom colour" },
];

const FLEX_WITH_COLOUR_AND_VARIENT_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["Small (2×1 ft)", "Medium (4×2 ft)", "Large (6×3 ft)", "Extra Large (8×4 ft)", "Custom"], allowCustom: true },
  { key: "customWidth", label: "Width (ft)", type: "number", hidden: true },
  { key: "customHeight", label: "Height (ft)", type: "number", hidden: true },
  { key: "orientation", label: "Orientation", type: "select", options: ["Horizontal", "Vertical"] },
  { key: "required", label: "Required", type: "select", options: ["Flex Only", "Flex with Frame"] },
  { key: "colour", label: "Colour", type: "select", options: ["Red", "Blue", "Green", "Yellow", "Custom"], allowCustom: true, customPlaceholder: "Enter custom colour" },
  { key: "bottomVarient", label: "Bottom Varient", type: "select", options: ["Stand", "Flat"] },
];

const VISITING_CARD_FIELDS = [
  { key: "size", label: "Card Size", type: "select", options: ["3.5x2 inches", "Custom"], allowCustom: true, customPlaceholder: "Enter custom size" },
  { key: "orientation", label: "Orientation", type: "select", options: ["Horizontal", "Vertical"] },
  { key: "cornerType", label: "Corner Type", type: "select", options: ["Normal", "Round"] },
  { key: "paperGsm", label: "Paper GSM", type: "select", options: ["300", "350", "400"] },
  { key: "printType", label: "Print Type", type: "select", options: ["Front Only", "Front & Back"] },
  { key: "color", label: "Color", type: "select", options: ["Single", "Multi"] },
  { key: "lamination", label: "Lamination", type: "select", options: ["Matte", "Gloss", "Velvet", "Embossing", "Foil Gold", "Foil Silver"] },
];

const REFLECTOR_FLEX_FIELDS = [
  { key: "size", label: "Size", type: "text", placeholder: "Enter custom size" },
  { key: "orientation", label: "Orientation", type: "select", options: ["Horizontal", "Vertical"] },
  { key: "colour", label: "Colour", type: "select", options: ["Red", "Blue", "Yellow", "Pink", "Custom"], allowCustom: true, customPlaceholder: "Enter custom colour" },
];

const BLACK_LIGHT_FLEX_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["Custom"], allowCustom: true },
  { key: "customWidth", label: "Width (ft)", type: "number", hidden: true },
  { key: "customHeight", label: "Height (ft)", type: "number", hidden: true },
  { key: "ledType", label: "Led Type", type: "select", options: ["Box", "Flex", "Back Side Led Tubelight"] },
];

const LED_CUTTING_WITH_LIGHTING_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["Mock Small (2×1 ft)", "Mock Medium (4×2 ft)", "Mock Large (6×3 ft)", "Custom"], allowCustom: true },
  { key: "customWidth", label: "Width (ft)", type: "number", hidden: true },
  { key: "customHeight", label: "Height (ft)", type: "number", hidden: true },
  { key: "ledType", label: "Led Type", type: "select", options: ["Box", "Flex", "Back Side Led Tubelight"] },
];

const AGRALIC_2D_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["Small (2×1 ft)", "Medium (4×2 ft)", "Large (6×3 ft)", "Extra Large (8×4 ft)", "Custom"], allowCustom: true },
  { key: "customWidth", label: "Width (ft)", type: "number", hidden: true },
  { key: "customHeight", label: "Height (ft)", type: "number", hidden: true },
  { key: "requirementDetails", label: "Requirement Details", type: "text", placeholder: "Enter requirement details" },
];

const AGRALIC_3D_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["Small (2×1×1 ft)", "Medium (4×2×1.5 ft)", "Large (6×3×2 ft)", "Extra Large (8×4×2.5 ft)", "Custom"], allowCustom: true },
  { key: "customWidth", label: "Width (ft)", type: "number", hidden: true },
  { key: "customHeight", label: "Height (ft)", type: "number", hidden: true },
  { key: "customDepth", label: "Depth (ft)", type: "number", hidden: true },
  { key: "requirementDetails", label: "Requirement Details", type: "text", placeholder: "Enter requirement details" },
];

const CUSTOM_PAPER_STICKER_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["Small (2×1 inch)", "Medium (3×2 inch)", "Large (4×3 inch)", "Custom"], allowCustom: true, customPlaceholder: "Enter custom size" },
  { key: "stickerShape", label: "Sticker Shape", type: "select", options: ["Square", "Round"] },
  { key: "pastingType", label: "Pasting Type (Product)", type: "select", options: ["Custom"], allowCustom: true, customPlaceholder: "Enter custom pasting type" },
  { key: "lamination", label: "Lamination", type: "select", options: ["Matte", "Gloss"] },
  { key: "stickerType", label: "Sticker Type", type: "select", options: ["Roll", "Sheet"] },
];

const VINYL_STICKER_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["Small (2×1 inch)", "Medium (3×2 inch)", "Large (4×3 inch)", "Custom"], allowCustom: true, customPlaceholder: "Enter custom size" },
  { key: "stickerShape", label: "Sticker Shape", type: "select", options: ["Square", "Round"] },
  { key: "pastingType", label: "Pasting Type (Product)", type: "select", options: ["Custom"], allowCustom: true, customPlaceholder: "Enter custom pasting type" },
  { key: "lamination", label: "Lamination", type: "select", options: ["Matte", "Gloss", "Transparent"] },
  { key: "stickerType", label: "Sticker Type", type: "select", options: ["Roll", "Sheet"] },
  { key: "gummingType", label: "Gumming Type", type: "select", options: ["Normal Gum", "SunSui Gum"] },
];

const POLYCARBONATE_STICKER_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["Small (2×1 inch)", "Medium (3×2 inch)", "Large (4×3 inch)", "Custom"], allowCustom: true, customPlaceholder: "Enter custom size" },
  { key: "stickerShape", label: "Sticker Shape", type: "select", options: ["Square", "Round"] },
  { key: "pastingType", label: "Pasting Type (Product)", type: "select", options: ["Custom"], allowCustom: true, customPlaceholder: "Enter custom pasting type" },
  { key: "lamination", label: "Lamination", type: "select", options: ["Matte", "Gloss", "Transparent"] },
  { key: "stickerType", label: "Sticker Type", type: "select", options: ["Roll", "Sheet"] },
  { key: "gummingType", label: "Gumming Type", type: "select", options: ["Normal Gum", "SunSui Gum"] },
];

const FOAM_STICKER_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["Small (2×1 inch)", "Medium (3×2 inch)", "Large (4×3 inch)", "Custom"], allowCustom: true, customPlaceholder: "Enter custom size" },
  { key: "stickerShape", label: "Sticker Shape", type: "select", options: ["Square", "Round"] },
  { key: "pastingType", label: "Pasting Type (Product)", type: "select", options: ["Custom"], allowCustom: true, customPlaceholder: "Enter custom pasting type" },
  { key: "lamination", label: "Lamination", type: "select", options: ["Matte", "Gloss"] },
  { key: "stickerType", label: "Sticker Type", type: "select", options: ["Roll", "Sheet"] },
  { key: "foamThickness", label: "Foam Thickness", type: "select", options: ["3 Mm", "4 Mm", "5 Mm", "8 Mm"] },
];

const ZIPPER_POUCH_FIELDS = [
  { key: "widthMm", label: "Width (mm)", type: "number" },
  { key: "heightMm", label: "Height (mm)", type: "number" },
  { key: "gussetMm", label: "Gusset (mm)", type: "number" },
  { key: "material", label: "Material", type: "select", options: ["BOPP", "PET/PE", "Foil"] },
  { key: "layers", label: "Layers", type: "select", options: ["2", "3", "4"] },
  { key: "pouchType", label: "Type", type: "select", options: ["Fully Closed", "With Window", "One Side Open", "Both Side Transparent", "Without Zipper"] },
  { key: "printingMethod", label: "Printing Method", type: "select", options: ["Digital", "Rotogravure", "Flexo"] },
  { key: "printType", label: "Print Type", type: "select", options: ["Single", "Multicolour"] },
  { key: "finish", label: "Finish", type: "select", options: ["Matte", "Glossy"] },
  { key: "zipper", label: "Zipper", type: "select", options: ["Yes", "No"] },
  { key: "tearNotch", label: "Tear Notch", type: "select", options: ["Yes", "No"] },
  { key: "foodGrade", label: "Food Grade", type: "select", options: ["Yes", "No"] },
];

const ZIPPER_POUCH_PLAIN_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "width", label: "Width", type: "text", placeholder: "Custom" },
  { key: "height", label: "Height", type: "text", placeholder: "Custom" },
  { key: "gusset", label: "Gusset", type: "text", placeholder: "Custom" },
  { key: "layers", label: "Layers", type: "select", options: ["2", "3", "4"] },
  { key: "material", label: "Material", type: "select", options: ["BOPP", "PET/PE", "FOIL"] },
  { key: "zipperType", label: "Zipper Type", type: "select", options: ["With Zipper", "Without Zipper"] },
  { key: "tearNotch", label: "Tear Notch", type: "select", options: ["Yes", "No"] },
  { key: "printingMethod", label: "Printing Method", type: "select", options: ["Digital", "Rotogravure", "Flexo"] },
  { key: "printing", label: "Printing", type: "select", options: ["Single", "Multicolour"] },
];

const BOTH_SIDE_TRANSPARENT_POUCH_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "width", label: "Width", type: "text", placeholder: "Custom" },
  { key: "height", label: "Height", type: "text", placeholder: "Custom" },
  { key: "gusset", label: "Gusset", type: "text", placeholder: "Custom" },
  { key: "layers", label: "Layers", type: "select", options: ["2", "3", "4"] },
  { key: "zipperType", label: "Zipper Type", type: "select", options: ["With Zipper", "Without Zipper"] },
  { key: "windowType", label: "Window Type", type: "select", options: ["With Window", "Without Window"] },
  { key: "tearNotch", label: "Tear Notch", type: "select", options: ["Yes", "No"] },
  { key: "foodGrade", label: "Food Grade", type: "select", options: ["Yes", "No"] },
];

const PRINTING_ZIPPER_POUCH_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "width", label: "Width", type: "text", placeholder: "Custom" },
  { key: "height", label: "Height", type: "text", placeholder: "Custom" },
  { key: "gusset", label: "Gusset", type: "text", placeholder: "Custom" },
  { key: "layers", label: "Layers", type: "select", options: ["2", "3", "4"] },
  { key: "zipperType", label: "Zipper Type", type: "select", options: ["With Zipper", "Without Zipper"] },
  { key: "windowType", label: "Window Type", type: "select", options: ["With Window", "Without Window"] },
  { key: "tearNotch", label: "Tear Notch", type: "select", options: ["Yes", "No"] },
  { key: "printingType", label: "Printing Type", type: "select", options: ["Single", "Double", "Multicolour"] },
  { key: "printingMethod", label: "Printing Method", type: "select", options: ["Screen Printing", "Digital", "Rotogravure", "Flexo"] },
  { key: "printingSides", label: "Printing Sides", type: "select", options: ["Front Only", "Back", "Front & Back"] },
  { key: "foodGrade", label: "Food Grade", type: "select", options: ["Yes", "No"] },
];

const ONE_SIDE_SILVER_ONE_SIDE_TRANSPARENT_POUCH_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "width", label: "Width", type: "text", placeholder: "Custom" },
  { key: "height", label: "Height", type: "text", placeholder: "Custom" },
  { key: "gusset", label: "Gusset", type: "text", placeholder: "Custom" },
  { key: "layers", label: "Layers", type: "select", options: ["2", "3", "4"] },
  { key: "zipperType", label: "Zipper Type", type: "select", options: ["With Zipper", "Without Zipper"] },
  { key: "tearNotch", label: "Tear Notch", type: "select", options: ["Yes", "No"] },
  { key: "printingType", label: "Printing Type", type: "select", options: ["Single", "Double", "Multicolour"] },
  { key: "printingMethod", label: "Printing Method", type: "select", options: ["Screen Printing", "Digital", "Rotogravure", "Flexo"] },
  { key: "foodGrade", label: "Food Grade", type: "select", options: ["Yes", "No"] },
];

const ENVELOPE_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["DL (110×220 mm)", "C6 (114×162 mm)", "C5 (162×229 mm)", "C4 (229×324 mm)", "Custom"], allowCustom: true, customPlaceholder: "Enter custom size" },
  { key: "colour", label: "Colour", type: "select", options: ["Single colour", "Multicolour"] },
  { key: "printType", label: "Print Type", type: "select", options: ["Front Only", "Front & Back"] },
];

const NOTEPAD_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["A4", "A5", "Legal"] },
  { key: "color", label: "Color", type: "select", options: ["Single", "Multi"] },
  { key: "gsm", label: "GSM", type: "select", options: ["70 Gsm", "80 Gsm", "100 Gsm"] },
  { key: "requirementDetails", label: "Requirement Details", type: "text", placeholder: "Enter requirement details" },
];

const DAIRY_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["Small (5×7 inch)", "Medium (7×10 inch)", "Large (8.5×11 inch)", "A5 (5.8×8.3 inch)", "Custom"], allowCustom: true, customPlaceholder: "Enter custom size" },
  { key: "dairyType", label: "Dairy Type", type: "select", options: ["Readymade", "Customize"] },
  { key: "customize", label: "Customize", type: "select", options: ["Inner Detail", "Outer Details"] },
  { key: "dairyOuterType", label: "Dairy Outer Type", type: "select", options: ["Leather", "Art Paper"] },
  { key: "colour", label: "Colour", type: "select", options: ["Single colour", "Multicolour"] },
];

const DAILY_CALENDAR_FIELDS = [
  { key: "variant", label: "Variant", type: "select", options: ["Normal", "Dye Cut", "Gold Foil"] },
  { key: "size", label: "Calendar Size", type: "select", options: ["6 x 9", "10 x 15", "12 x 18", "5 x 20", "11 x 17", "14 x 24", "20 x 30", "23 x 36", "Custom"], allowCustom: true, customPlaceholder: "Enter custom size" },
  { key: "cakeSize", label: "Cake Size", type: "select", options: ["4 No", "5 No", "6 No", "7 No", "20 No", "Mega"] },
  { key: "colour", label: "Colour", type: "select", options: ["Single", "Double", "Multi"] },
];

const MONTHLY_CALENDAR_FIELDS = [
  { key: "paperVariant", label: "Paper Variant", type: "select", options: ["Maplitho Paper", "Art Paper"] },
  { key: "gsm", label: "GSM", type: "select", options: ["70 Gsm", "80 Gsm", "100 Gsm", "120 Gsm", "180 Gsm"] },
  { key: "size", label: "Size", type: "select", options: ["15 x 20", "17 x 27", "20 x 29", "20 x 30", "Custom"], allowCustom: true, customPlaceholder: "Enter custom size" },
  { key: "sheet", label: "Sheet", type: "select", options: ["6 Sheet", "12 Sheet"] },
  { key: "colour", label: "Colour", type: "select", options: ["Single", "Multi"] },
];

const POCKET_CALENDAR_FIELDS = [
  { key: "gsm", label: "GSM", type: "text", placeholder: "Enter GSM" },
  { key: "size", label: "Size", type: "select", options: ["3.5 x 5 inch", "4 x 6 inch", "5 x 7 inch", "6 x 8 inch", "Custom"], allowCustom: true, customPlaceholder: "Enter custom size" },
  { key: "lamination", label: "Lamination", type: "select", options: ["Matt", "Glossy"] },
];

const TABLE_TOP_CALENDAR_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["8.25 x 8.75 (Approx)", "9.2 x 6.1 (Approx)", "10 x 5.7 (Approx)", "Custom"], allowCustom: true, customPlaceholder: "Enter custom size" },
  { key: "colour", label: "Colour", type: "select", options: ["Single", "Multi"] },
  { key: "gsm", label: "GSM", type: "text", placeholder: "Enter GSM" },
  { key: "bottomType", label: "Bottom Type", type: "select", options: ["With Square", "Without Square"] },
];

const DOCTOR_FILE_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["19.25 x 12.20 (Inches)", "17.72 x 12.44 (Inches)", "Custom"], allowCustom: true, customPlaceholder: "Enter custom size" },
  { key: "gsm", label: "GSM", type: "select", options: ["300 Gsm", "400 Gsm"] },
  { key: "fileFinishing", label: "File Finishing", type: "select", options: ["Creasing", "Creasing + Punching", "Dye Cut"] },
  { key: "lamination", label: "Lamination", type: "select", options: ["Matt", "Glossy"] },
  { key: "paper", label: "Paper", type: "select", options: ["Synthetic", "Normal"] },
  { key: "innerType", label: "Inner Type", type: "select", options: ["Clip", "Pouch", "Clip & Pouch"] },
  { key: "sides", label: "Sides", type: "text", placeholder: "Enter number of sides" },
];

const PAMPHLET_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["A4", "A5", "Legal", "Custom"], allowCustom: true, customPlaceholder: "Enter custom size" },
  { key: "colour", label: "Colour", type: "select", options: ["Single colour", "Multicolour"] },
  { key: "printType", label: "Print Type", type: "select", options: ["Front Only", "Front & Back"] },
];

const BROCHURE_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["A4 (210 x 297 mm)", "A5 (148 x 210 mm)", "6 x 9 inch", "8.5 x 11 inch", "Custom"], allowCustom: true, customPlaceholder: "Enter custom size" },
  { key: "paperVariant", label: "Paper Variant", type: "select", options: ["Maplitho Paper", "Art Paper"] },
  { key: "lamination", label: "Lamination", type: "select", options: ["Matt", "Glossy"] },
  { key: "gsm", label: "GSM", type: "select", options: ["70 Gsm", "80 Gsm", "100 Gsm", "120 Gsm", "150 Gsm", "Custom"], allowCustom: true, customPlaceholder: "Enter custom GSM" },
];

const CORRUGATED_ROLL_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "length", label: "Length (Size)", type: "text", placeholder: "Enter length" },
  { key: "height", label: "Height (Size)", type: "text", placeholder: "Enter height" },
  { key: "ply", label: "Ply", type: "select", options: ["2"] },
  { key: "fluteType", label: "Flute Type", type: "select", options: ["E", "B", "C", "BC"] },
  { key: "boardGsm", label: "Board GSM", type: "text", placeholder: "Enter GSM" },
  { key: "printingMethod", label: "Printing Method", type: "select", options: ["Offset", "Screen Printing"] },
  { key: "printColours", label: "Print Colours", type: "select", options: ["Plain", "1 Colour", "2 Colour", "Multi Colour"] },
]; // Measurement appears first, right after Quantity

const CORRUGATED_SHEET_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "length", label: "Length (Size)", type: "text", placeholder: "Enter length" },
  { key: "height", label: "Height (Size)", type: "text", placeholder: "Enter height" },
  { key: "ply", label: "Ply", type: "select", options: ["3", "5", "7"] },
  { key: "fluteType", label: "Flute Type", type: "select", options: ["E", "B", "C", "BC"] },
  { key: "boardGsm", label: "Board GSM", type: "text", placeholder: "Enter GSM" },
  { key: "printingMethod", label: "Printing Method", type: "select", options: ["Offset", "Screen Printing"] },
  { key: "printColours", label: "Print Colours", type: "select", options: ["Plain", "1 Colour", "2 Colour", "Multi Colour"] },
];

const CAKE_BOX_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "length", label: "Length (Size)", type: "text", placeholder: "Enter length" },
  { key: "width", label: "Width (Size)", type: "text", placeholder: "Enter width" },
  { key: "height", label: "Height (Size)", type: "text", placeholder: "Enter height" },
  { key: "gsm", label: "Gsm", type: "text", placeholder: "Enter GSM" },
  { key: "lamination", label: "Lamination", type: "select", options: ["Matt", "Gloss"] },
  { key: "boxOuterType", label: "Box Outer Type", type: "select", options: ["White", "Readymade Box"] },
  { key: "windowType", label: "Window Type", type: "select", options: ["With Window", "Without Window"] },
];

const JAR_CAKE_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "length", label: "Length (Size)", type: "text", placeholder: "Enter length" },
  { key: "width", label: "Width (Size)", type: "text", placeholder: "Enter width" },
  { key: "height", label: "Height (Size)", type: "text", placeholder: "Enter height" },
  { key: "gsm", label: "Gsm", type: "text", placeholder: "Enter GSM" },
  { key: "lamination", label: "Lamination", type: "select", options: ["Matt", "Gloss"] },
  { key: "boxOuterType", label: "Box Outer Type", type: "select", options: ["White", "Readymade Box"] },
  { key: "windowType", label: "Window Type", type: "select", options: ["With Window", "Without Window"] },
  { key: "handleType", label: "Handle Type", type: "select", options: ["With Handle", "Without Handle"] },
];

const SANDWICH_WAFFLE_BOX_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "length", label: "Length (Size)", type: "text", placeholder: "Enter length" },
  { key: "width", label: "Width (Size)", type: "text", placeholder: "Enter width" },
  { key: "height", label: "Height (Size)", type: "text", placeholder: "Enter height" },
  { key: "boxType", label: "Box Type", type: "select", options: ["Plain", "Readymade", "Customized"] },
  { key: "windowType", label: "Window Type", type: "select", options: ["With Window", "Without Window"] },
  { key: "innerLamination", label: "Inner Lamination", type: "select", options: ["With Lamination", "Without Lamination"] },
];

const BURGER_BOX_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "length", label: "Length (Size)", type: "text", placeholder: "Enter length" },
  { key: "width", label: "Width (Size)", type: "text", placeholder: "Enter width" },
  { key: "height", label: "Height (Size)", type: "text", placeholder: "Enter height" },
  { key: "boxType", label: "Box Type", type: "select", options: ["Plain", "Readymade", "Customized"] },
  { key: "windowType", label: "Window Type", type: "select", options: ["With Window", "Without Window"] },
  { key: "innerLamination", label: "Inner Lamination", type: "select", options: ["With Lamination", "Without Lamination"] },
  { key: "foldingType", label: "Folding Type", type: "select", options: ["Manual", "Customized"] },
];

const POPCORN_BOX_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "length", label: "Length (Size)", type: "text", placeholder: "Enter length" },
  { key: "width", label: "Width (Size)", type: "text", placeholder: "Enter width" },
  { key: "height", label: "Height (Size)", type: "text", placeholder: "Enter height" },
  { key: "innerLamination", label: "Inner Lamination", type: "select", options: ["With Lamination", "Without Lamination"] },
  { key: "shapeType", label: "Shape Type", type: "select", options: ["Round", "Square", "Dye Cut Model"] },
  { key: "boxType", label: "Box Type", type: "select", options: ["Plain", "Readymade", "Customized"] },
];

const BIRIYANI_BOX_FIELDS = [
  { key: "boxType", label: "Box Type", type: "select", options: ["Plastic", "Board"] },
  { key: "shapeType", label: "Shape Type", type: "select", options: ["Round", "Square"] },
  { key: "handleType", label: "Handle Type", type: "select", options: ["With Handle", "Without Handle"] },
  { key: "innerLamination", label: "Inner Lamination", type: "select", options: ["With Lamination", "Without Lamination"] },
  { key: "colour", label: "Colour", type: "select", options: ["Plain", "Readymade", "Customized"] },
  { key: "size", label: "Size", type: "select", options: ["Small", "Medium", "Large"] },
];

const CUP_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch"] },
  { key: "size", label: "Size", type: "select", options: ["Small", "Medium", "Large"] },
  { key: "boxType", label: "Box Type", type: "select", options: ["Plain", "Readymade", "Customized"] },
  { key: "innerLamination", label: "Inner Lamination", type: "select", options: ["With Lamination", "Without Lamination"] },
  { key: "cupType", label: "Cup Type", type: "select", options: ["Plain", "Readymade", "Customized"] },
];

const JUICE_CUP_WITH_SPOUT_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch"] },
  { key: "size", label: "Size", type: "select", options: ["Small", "Medium", "Large"] },
  { key: "boxType", label: "Box Type", type: "select", options: ["Plain", "Readymade", "Customized"] },
  { key: "innerLamination", label: "Inner Lamination", type: "select", options: ["With Lamination", "Without Lamination"] },
  { key: "cupType", label: "Cup Type", type: "select", options: ["Plastic", "Organic"] },
];

const TRAY_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch"] },
  { key: "size", label: "Size", type: "select", options: ["Small", "Medium", "Large"] },
  { key: "boxType", label: "Box Type", type: "select", options: ["Plain", "Readymade", "Customized"] },
  { key: "innerLamination", label: "Inner Lamination", type: "select", options: ["With Lamination", "Without Lamination"] },
  { key: "cupType", label: "Cup Type", type: "select", options: ["Plain", "Readymade", "Customized"] },
];

const SWEET_BOX_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "length", label: "Length (Size)", type: "text", placeholder: "Enter length" },
  { key: "width", label: "Width (Size)", type: "text", placeholder: "Enter width" },
  { key: "height", label: "Height (Size)", type: "text", placeholder: "Enter height" },
  { key: "gsm", label: "Gsm", type: "text", placeholder: "Enter GSM" },
  { key: "lamination", label: "Lamination", type: "select", options: ["Matt", "Gloss"] },
  { key: "boxOuterType", label: "Box Outer Type", type: "select", options: ["White", "Readymade Box"] },
  { key: "windowType", label: "Window Type", type: "select", options: ["With Window", "Without Window"] },
  { key: "partition", label: "Partition", type: "select", options: ["With Partition", "Without Partition"] },
  { key: "innerLamination", label: "Inner Lamination", type: "select", options: ["With Lamination", "Without Lamination"] },
];

const CAKE_BASE_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["Small (6 inch)", "Medium (8 inch)", "Large (10 inch)", "Custom"], allowCustom: true },
  { key: "customWidth", label: "Width (mm)", type: "number", hidden: true },
  { key: "customHeight", label: "Height (mm)", type: "number", hidden: true },
  { key: "colour", label: "Colour", type: "select", options: ["Gold", "Silver"] },
  { key: "printingMethod", label: "Printing Method", type: "select", options: ["With Printing", "Without Printing"] },
  { key: "shapeType", label: "Shape Type", type: "select", options: ["Round", "Square", "Dye Cut Model"] },
];

const BROWNIE_BOX_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["Small (4×4×2 inch)", "Medium (6×6×3 inch)", "Large (8×8×4 inch)", "Custom"], allowCustom: true },
  { key: "customWidth", label: "Width (mm)", type: "number", hidden: true },
  { key: "customHeight", label: "Height (mm)", type: "number", hidden: true },
  { key: "customDepth", label: "Depth (mm)", type: "number", hidden: true },
  { key: "productQty", label: "Product Qty", type: "select", options: ["1 Pcs", "3 Pcs", "4 Pcs", "6 Pcs", "9 Pcs"] },
  { key: "windowType", label: "Window Type", type: "select", options: ["With Window", "Without Window"] },
  { key: "gsm", label: "Gsm", type: "text", placeholder: "Enter GSM" },
];

const CUP_CAKEE_BOX_FIELDS = [
  { key: "size", label: "Size", type: "select", options: ["Single (3×3×3 inch)", "4 Cavity (8×4×3 inch)", "6 Cavity (8×8×3 inch)", "Custom"], allowCustom: true },
  { key: "customWidth", label: "Width (mm)", type: "number", hidden: true },
  { key: "customHeight", label: "Height (mm)", type: "number", hidden: true },
  { key: "customDepth", label: "Depth (mm)", type: "number", hidden: true },
  { key: "gsm", label: "Gsm", type: "text", placeholder: "Enter GSM" },
  { key: "windowType", label: "Window Type", type: "select", options: ["With Window", "Without Window"] },
  { key: "partition", label: "Partition", type: "select", options: ["With Partition", "Without Partition"] },
  { key: "innerLamination", label: "Inner Lamination", type: "select", options: ["With Lamination", "Without Lamination"] },
];

const BENTO_BOX_FIELDS = [
  { key: "type", label: "Type", type: "select", options: ["Plastic", "Wood", "Bambo"] },
  { key: "size", label: "Size", type: "select", options: ["Small (6×4×3 inch)", "Medium (8×6×4 inch)", "Large (10×8×5 inch)", "Custom"], allowCustom: true },
  { key: "customWidth", label: "Width (mm)", type: "number", hidden: true },
  { key: "customHeight", label: "Height (mm)", type: "number", hidden: true },
  { key: "customDepth", label: "Depth (mm)", type: "number", hidden: true },
];

const SELFLOCK_MAILER_FLAP_BOX_FIELDS = [
  { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
  { key: "length", label: "Length (Size)", type: "text", placeholder: "Enter length" },
  { key: "width", label: "Width (Size)", type: "text", placeholder: "Enter width" },
  { key: "height", label: "Height (Size)", type: "text", placeholder: "Enter height" },
  { key: "loadCapacity", label: "Load Capacity", type: "select", options: ["Kg", "Gram", "Custom"], allowCustom: true, customPlaceholder: "Enter custom capacity" },
  { key: "boxStyle", label: "Box Style", type: "select", options: ["Rsc", "Dye Cut"] },
  { key: "ply", label: "Ply", type: "select", options: ["3", "5", "7"] },
  { key: "fluteType", label: "Flute Type", type: "select", options: ["E", "B", "C", "BC"] },
  { key: "boardGsm", label: "Board GSM", type: "text", placeholder: "Enter GSM" },
  { key: "printingMethod", label: "Printing Method", type: "select", options: ["Offset", "Screen Printing"] },
  { key: "printColours", label: "Print Colours", type: "select", options: ["Plain", "1 Colour", "2 Colour", "Multi Colour"] },
  { key: "boxInnerColour", label: "Box Inner Colour Type", type: "select", options: ["White", "Golden Brown", "Normal Brown", "Ice Brown"] },
  { key: "boxOuterColour", label: "Box Outer Colour Type", type: "select", options: ["White", "Golden Brown", "Normal Brown", "Ice Brown"] },
  { key: "productType", label: "Product Type", type: "text", placeholder: "Enter product type" },
];

const PRODUCT_FIELDS = {
  "visiting card": VISITING_CARD_FIELDS,
  "normal visiting card": VISITING_CARD_FIELDS,
  "synthetic visiting card": VISITING_CARD_FIELDS,
  "scent card visiting card": VISITING_CARD_FIELDS,
  "curve cutting visiting card": VISITING_CARD_FIELDS,
  "uv visiting card": VISITING_CARD_FIELDS,
  "flex printing": FLEX_PRINTING_FIELDS,
  "normal flex": FLEX_PRINTING_FIELDS,
  "black media flex": FLEX_PRINTING_FIELDS,
  "star flex": FLEX_PRINTING_FIELDS,
  "reflector flex": REFLECTOR_FLEX_FIELDS,
  "roll up standee": FLEX_WITH_COLOUR_AND_VARIENT_FIELDS,
  "promotional umbrella": FLEX_WITH_COLOUR_AND_VARIENT_FIELDS,
  "black light flex": BLACK_LIGHT_FLEX_FIELDS,
  "led cutting with lighting": LED_CUTTING_WITH_LIGHTING_FIELDS,
  "2d agralic": AGRALIC_2D_FIELDS,
  "3d agralic": AGRALIC_3D_FIELDS,
  "normal paper sticker": CUSTOM_PAPER_STICKER_FIELDS,
  "vinyl sticker": VINYL_STICKER_FIELDS,
  "polycarbonate sticker": POLYCARBONATE_STICKER_FIELDS,
  "dome sticker": CUSTOM_PAPER_STICKER_FIELDS,
  "pvc sticker": CUSTOM_PAPER_STICKER_FIELDS,
  "foam": FOAM_STICKER_FIELDS,
  "sun pack board": CUSTOM_PAPER_STICKER_FIELDS,
  "sticker items": [
    { key: "shape", label: "Shape", type: "select", options: ["Rectangle", "Circle", "Square", "Custom die-cut"] },
    { key: "widthMm", label: "Width (mm)", type: "number" },
    { key: "heightMm", label: "Height (mm)", type: "number" },
    { key: "lamination", label: "Lamination", type: "select", options: ["None", "Matte", "Glossy", "UV"] },
    { key: "adhesive", label: "Adhesive", type: "select", options: ["Permanent", "Removable", "Waterproof"] },
    { key: "printColours", label: "Print Colours", type: "select", options: ["Full colour CMYK", "Single colour", "2 colour"] },
  ],
  "led sign board": [
    { key: "widthFt", label: "Width (ft)", type: "number" },
    { key: "heightFt", label: "Height (ft)", type: "number" },
    { key: "ledColour", label: "LED Colour", type: "select", options: ["White", "Warm white", "RGB multicolour", "Red", "Blue", "Green"] },
    { key: "mounting", label: "Mounting", type: "select", options: ["Wall mount", "Ceiling hang", "Stand alone", "Pole mount"] },
    { key: "powerSupply", label: "Power Supply", type: "select", options: ["Indoor 220V", "Outdoor weatherproof"] },
  ],
  "stationery": [
    { key: "size", label: "Size", type: "select", options: ["A4", "A5", "A6", "DL", "Custom"] },
    { key: "paperGsm", label: "Paper GSM", type: "select", options: ["70", "90", "130", "170", "300"] },
    { key: "pagesSheets", label: "Pages / Sheets", type: "number" },
    { key: "printSides", label: "Print Sides", type: "select", options: ["Single", "Both"] },
    { key: "binding", label: "Binding", type: "select", options: ["None", "Saddle stitch", "Perfect bind", "Spiral"] },
    { key: "coverFinish", label: "Cover Finish", type: "select", options: ["None", "Matte lamination", "Glossy lamination", "UV coating"] },
  ],
  "packaging box": BOX_PACKAGING_FIELDS,
  "fast food box": BOX_PACKAGING_FIELDS,
  "corrugated box": BOX_PACKAGING_FIELDS,
  "frame box": BOX_PACKAGING_FIELDS,
  "food box": BOX_PACKAGING_FIELDS,
  "gift box": BOX_PACKAGING_FIELDS,
  "cake box": CAKE_BOX_FIELDS,
  "sweet box": SWEET_BOX_FIELDS,
  "pastry box": CAKE_BOX_FIELDS,
  "pizza box": CAKE_BOX_FIELDS,
  "tier cake box": CAKE_BOX_FIELDS,
  "plum box": CAKE_BOX_FIELDS,
  "cake base": CAKE_BASE_FIELDS,
  "brownie box": BROWNIE_BOX_FIELDS,
  "cup cake box": CUP_CAKEE_BOX_FIELDS,
  "bento box": BENTO_BOX_FIELDS,
  "candle box": CAKE_BOX_FIELDS,
  "jar cake": JAR_CAKE_FIELDS,
  "sandwich box": SANDWICH_WAFFLE_BOX_FIELDS,
  "sandwich waffle box": SANDWICH_WAFFLE_BOX_FIELDS,
  "dosa": SANDWICH_WAFFLE_BOX_FIELDS,
  "dosa,shawarma": SANDWICH_WAFFLE_BOX_FIELDS,
  "shawarma": SANDWICH_WAFFLE_BOX_FIELDS,
  "burger": BURGER_BOX_FIELDS,
  "popcorn box": POPCORN_BOX_FIELDS,
  "biryani box": BIRIYANI_BOX_FIELDS,
  "biriyani box": BIRIYANI_BOX_FIELDS,
  "cup": CUP_FIELDS,
  "juice cup with spout": JUICE_CUP_WITH_SPOUT_FIELDS,
  "ice cream": ICE_CREAM_FIELDS,
  "tray": TRAY_FIELDS,
  "monocotton box": MONOCOTTON_BOX_FIELDS,
  "branding box": BRANDING_BOX_FIELDS,
  "monocotton box / branding box": MONOCOTTON_BOX_FIELDS,
  "plain and customized box": PLAIN_CUSTOMIZED_BOX_FIELDS,
  knife: ACCESSORY_FIELDS,
  spoon: ACCESSORY_FIELDS,
  "wood spoon": ACCESSORY_FIELDS,
  "plastic spoon": ACCESSORY_FIELDS,
  "wood plastic spoon": WOOD_PLASTIC_SPOON_FIELDS,
  "wood/plastic spoon": WOOD_PLASTIC_SPOON_FIELDS,
  "zipper pouch": ZIPPER_POUCH_FIELDS,
  "zipper pouch plain": ZIPPER_POUCH_PLAIN_FIELDS,
  "both side transparent": BOTH_SIDE_TRANSPARENT_POUCH_FIELDS,
  "printing zipper pouch": PRINTING_ZIPPER_POUCH_FIELDS,
  "one side silver one side transparent": ONE_SIDE_SILVER_ONE_SIDE_TRANSPARENT_POUCH_FIELDS,
  "packaging pouch": ZIPPER_POUCH_FIELDS,
  "envelope": ENVELOPE_FIELDS,
  "notepad": NOTEPAD_FIELDS,
  "note pad": NOTEPAD_FIELDS,
  "dairy": DAIRY_FIELDS,
  "daily calendar": DAILY_CALENDAR_FIELDS,
  "daily calender": DAILY_CALENDAR_FIELDS,
  "monthly calendar": MONTHLY_CALENDAR_FIELDS,
  "monthly calender": MONTHLY_CALENDAR_FIELDS,
  "pocket calendar": POCKET_CALENDAR_FIELDS,
  "pocket calender": POCKET_CALENDAR_FIELDS,
  "table top calendar": TABLE_TOP_CALENDAR_FIELDS,
  "table top calender": TABLE_TOP_CALENDAR_FIELDS,
  "doctor file": DOCTOR_FILE_FIELDS,
  "pamphlet": PAMPHLET_FIELDS,
  "pamplat": PAMPHLET_FIELDS,
  "pamplet": PAMPHLET_FIELDS,
  "brochure": BROCHURE_FIELDS,
  "brochura": BROCHURE_FIELDS,
  "corrugated roll": CORRUGATED_ROLL_FIELDS,
  "corrugated sheet": CORRUGATED_SHEET_FIELDS,
  "corrugated board": CORRUGATED_SHEET_FIELDS,
  "selflock mailer flap box": SELFLOCK_MAILER_FLAP_BOX_FIELDS,
  "selflock mailore flap box": SELFLOCK_MAILER_FLAP_BOX_FIELDS,
};

const PRINTING_GENERIC_FIELDS = [
  { key: "size", label: "Size", type: "text", placeholder: "e.g. 3.5 x 2 inch, A4, 6 x 4 ft" },
  { key: "materialOrPaper", label: "Material / Paper", type: "text", placeholder: "e.g. 300 GSM art card, vinyl, acrylic" },
  { key: "printSides", label: "Printing Sides", type: "select", options: ["Front only", "Front & Back"] },
  { key: "finish", label: "Finish / Lamination", type: "text", placeholder: "e.g. matte, glossy, UV, none" },
  { key: "requirementDetails", label: "Requirement Details", type: "text", placeholder: "Any important print details" },
];

const PRODUCT_FIELD_ALIASES = {
  "universal cotton corrugation box": "packaging box",
  "universal box": "packaging box",
  "corrugation box": "packaging box",
  "selflock box": "selflock mailer flap box",
  "self lock box": "selflock mailer flap box",
  "mailer box": "selflock mailer flap box",
  "flap box": "selflock mailer flap box",
  "ice cream hole box": "packaging box",
  "ice cream mustroom holes box": "packaging box",
  "ice cream mushroom holes box": "packaging box",
  "cake box": "cake box",
  "sweet box": "sweet box",
  "pastry box": "cake box",
  "pasry box": "cake box",
  "pizza box": "cake box",
  "tier cake box": "cake box",
  "cake base": "cake base",
  "plum box": "cake box",
  "brownie box": "brownie box",
  "cupcake box": "packaging box",
  "cup cake box": "cup cake box",
  "bento box": "bento box",
  "jar cake": "jar cake",
  "candle box": "cake box",
  "sandwich box": "sandwich waffle box",
  "sandwich waffle box": "sandwich waffle box",
  "burger box": "burger",
  burger: "burger",
  "popcorn box": "popcorn box",
  "biryani box": "biryani box",
  "biriyani box": "biryani box",
  tray: "tray",
  monocarton: "packaging box",
  "monocotton box": "monocotton box",
  "branding box": "branding box",
  "monocotton box / branding box": "monocotton box",
  "monocotton box branding box": "monocotton box",
  "MONOCOTTON BOX / BRANDING BOX": "monocotton box",
  "plain and customized box": "plain and customized box",
  "one side fully close one side open": "zipper pouch",
  "both side transparent": "both side transparent",
  "one side silver one side transparent": "one side silver one side transparent",
  "fully closed": "zipper pouch",
  "without zipper": "zipper pouch",
  "with window": "zipper pouch",
  "zippe pouch plain": "zipper pouch",
  cylinder: "zipper pouch",
  digital: "zipper pouch",
  flexo: "zipper pouch",
  "screen printing": "zipper pouch",
  "wood plastic spoon": "wood plastic spoon",
  "wood/plastic spoon": "wood plastic spoon",
  "normal flex": "flex printing",
  "black media flex": "flex printing",
  "star flex": "flex printing",
  "reflector flex": "reflector flex",
  "roll up standee": "roll up standee",
  "promotional umbrella": "promotional umbrella",
  "normal paper sticker": "normal paper sticker",
  "paper sticker": "normal paper sticker",
  "normal sticker": "normal paper sticker",
  "vinyl": "vinyl sticker",
  "polycarbonate": "polycarbonate sticker",
  "dome": "dome sticker",
  "pvc": "pvc sticker",
  "visiting card": "visiting card",
  "normal visiting card": "visiting card",
  "synthetic visiting card": "visiting card",
  "scent card visiting card": "visiting card",
  "curve cutting visiting card": "visiting card",
  "uv visiting card": "visiting card",
};

const STYLE_PREF_OPTIONS = ["Minimal", "Bold", "Traditional", "Corporate", "Fun"];

function normalizeLookupKey(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveFieldSetByTokens(tokens) {
  if (!tokens.length) return null;
  const has = (word) => tokens.includes(word);
  const hasAny = (words) => words.some((word) => has(word));

  if (has("envelope")) {
    return ENVELOPE_FIELDS;
  }
  if (hasAny(["pouch", "zipper", "zippe"])) {
    return ZIPPER_POUCH_FIELDS;
  }
  if (hasAny(["cup", "spout"])) {
    return FOOD_CUP_FIELDS;
  }
  if (hasAny(["dosa", "shawarma"])) {
    return WRAP_FIELDS;
  }
  if (hasAny(["spoon", "knife"])) {
    return ACCESSORY_FIELDS;
  }
  if (has("box") || hasAny(["corrugated", "corrugation", "monocarton", "tray", "burger", "biryani", "popcorn"])) {
    return BOX_PACKAGING_FIELDS;
  }
  return null;
}

function resolveFieldSetByName(name) {
  if (!name) return null;
  const key = normalizeLookupKey(name);
  const aliasKey = PRODUCT_FIELD_ALIASES[key];
  if (aliasKey && PRODUCT_FIELDS[aliasKey]) return PRODUCT_FIELDS[aliasKey];
  if (PRODUCT_FIELDS[key]) return PRODUCT_FIELDS[key];

  const tokenMatch = resolveFieldSetByTokens(key.split(" ").filter(Boolean));
  if (tokenMatch) return tokenMatch;

  for (const [k, v] of Object.entries(PRODUCT_FIELDS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

function matchProductFields(typeName, subtypeName) {
  const subtypeMatch = resolveFieldSetByName(subtypeName);
  if (subtypeMatch) return subtypeMatch;
  return resolveFieldSetByName(typeName);
}

function readEntryFile(entry) {
  return new Promise((resolve, reject) => {
    entry.file(resolve, reject);
  });
}

function readDirectoryEntries(directoryEntry) {
  return new Promise((resolve, reject) => {
    const reader = directoryEntry.createReader();
    const allEntries = [];

    const readBatch = () => {
      reader.readEntries(
        (entries) => {
          if (!entries.length) {
            resolve(allEntries);
            return;
          }
          allEntries.push(...entries);
          readBatch();
        },
        (error) => reject(error),
      );
    };

    readBatch();
  });
}

async function collectDroppedFiles(items) {
  const collected = [];

  const walkEntry = async (entry) => {
    if (!entry) return;
    if (entry.isFile) {
      const file = await readEntryFile(entry);
      collected.push(file);
      return;
    }
    if (entry.isDirectory) {
      const entries = await readDirectoryEntries(entry);
      for (const child of entries) {
        // eslint-disable-next-line no-await-in-loop
        await walkEntry(child);
      }
    }
  };

  if (items && items.length > 0) {
    for (const item of Array.from(items)) {
      const entry = typeof item.webkitGetAsEntry === "function"
        ? item.webkitGetAsEntry()
        : null;
      if (entry) {
        // eslint-disable-next-line no-await-in-loop
        await walkEntry(entry);
        continue;
      }
      const file = item.getAsFile?.();
      if (file) {
        collected.push(file);
      }
    }
  }

  return collected;
}

export default function RequirementFormModal({
  show,
  onClose,
  leadId,
  onSaved,
  initialRequirement = null,
  serviceCategories = [],
  serviceTypes = [],
}) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Master data (provided by parent, no fetch needed)
  const categories = serviceCategories;
  const allTypes = serviceTypes;

  // Selections
  const [categoryId, setCategoryId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [subtypeId, setSubtypeId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [specs, setSpecs] = useState({});
  const [customSpecDialog, setCustomSpecDialog] = useState({
    open: false,
    field: null,
    value: "",
    isFlexCustomSize: false,
    flexWidth: "",
    flexHeight: "",
    sizeUnit: "mm",
  });
  const [depthSizeDialog, setDepthSizeDialog] = useState({ open: false, width: "", height: "", depth: "", sizeUnit: "mm" });

  // Design section
  const designStatus = "full_design";
  const setDesignStatus = () => {};
  const [designNotes, setDesignNotes] = useState("");
  const [stylePreference, setStylePreference] = useState("");
  const [colourPreference, setColourPreference] = useState("");
  const [referenceNotes, setReferenceNotes] = useState("");
  const [brandColours, setBrandColours] = useState("");
  const [useDesignFolderUpload, setUseDesignFolderUpload] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Delivery
  const [deliveryDate, setDeliveryDate] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Files
  const [files, setFiles] = useState([]);
  const isEditing = Boolean(initialRequirement?.id);


  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setStep(0);
      setError("");
      let parsedSpecs = {};
      try {
        parsedSpecs = initialRequirement?.specs
          ? JSON.parse(initialRequirement.specs)
          : {};
      } catch {
        parsedSpecs = {};
      }
      setCategoryId(initialRequirement?.categoryId ? String(initialRequirement.categoryId) : "");
      setTypeId(initialRequirement?.typeId ? String(initialRequirement.typeId) : "");
      setSubtypeId(initialRequirement?.subtypeId ? String(initialRequirement.subtypeId) : "");
      setQuantity(
        initialRequirement?.quantity != null ? String(initialRequirement.quantity) : "",
      );
      setSpecs(parsedSpecs);
      setDesignNotes(initialRequirement?.designNotes || "");
      setStylePreference(initialRequirement?.stylePreference || "");
      setColourPreference(initialRequirement?.colourPreference || "");
      setReferenceNotes(initialRequirement?.referenceNotes || "");
      setBrandColours(initialRequirement?.brandColours || "");
      setUseDesignFolderUpload(false);
      setIsDragActive(false);
      setDeliveryDate(initialRequirement?.deliveryDate || "");
      setSpecialInstructions(initialRequirement?.specialInstructions || "");
      setFiles([]);
      setCustomSpecDialog({ open: false, field: null, value: "" });
    }
  }, [show, initialRequirement]);

  // Derived lists
  const typeOptions = useMemo(() => {
    if (!categoryId) return [];
    return allTypes.filter(
      (t) => String(t.categoryId) === String(categoryId) && !t.parentId,
    );
  }, [allTypes, categoryId]);

  const subtypeOptions = useMemo(() => {
    if (!typeId) return [];
    return allTypes.filter((t) => String(t.parentId) === String(typeId));
  }, [allTypes, typeId]);

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(categoryId)),
    [categories, categoryId],
  );
  const selectedType = useMemo(
    () => allTypes.find((t) => String(t.id) === String(typeId)),
    [allTypes, typeId],
  );
  const selectedSubtype = useMemo(
    () => allTypes.find((t) => String(t.id) === String(subtypeId)),
    [allTypes, subtypeId],
  );

  const productFields = useMemo(() => {
    const categoryName = selectedCategory?.name?.trim().toLowerCase();
    const matchedFields = matchProductFields(selectedType?.name, selectedSubtype?.name);
    if (categoryName === "printing") {
      return matchedFields || PRINTING_GENERIC_FIELDS;
    }
    return matchedFields;
  }, [selectedCategory, selectedType, selectedSubtype]);

  const specificationSteps = useMemo(() => {
    if (!productFields || productFields.length === 0) {
      return [{ section: "Specification", fields: [] }];
    }
    // If more than 8 fields, split into multiple tabs with smart distribution
    if (productFields.length > 8) {
      const numTabs = Math.ceil(productFields.length / 8);
      const fieldsPerTab = Math.ceil(productFields.length / numTabs);
      const chunks = [];
      for (let i = 0; i < productFields.length; i += fieldsPerTab) {
        chunks.push(productFields.slice(i, i + fieldsPerTab));
      }
      return chunks.map((chunk, idx) => ({
        section: idx === 0 ? "Specification" : `Specification ${idx + 1}`,
        fields: chunk,
      }));
    }
    return [{ section: "Specification", fields: productFields }];
  }, [productFields]);

  const specificationStepCount = specificationSteps.length;
  const firstSpecificationStep = 1;
  const designStep = firstSpecificationStep + specificationStepCount;
  const deliveryStep = designStep + 1;
  const isSpecificationStep = step >= firstSpecificationStep && step < designStep;
  const isFirstSpecificationStep = step === firstSpecificationStep;
  const currentSpecification = specificationSteps[
    Math.max(0, Math.min(step - firstSpecificationStep, specificationSteps.length - 1))
  ] || { section: "Specification", fields: [] };

  const stepLabels = useMemo(() => ([
    "Product",
    ...specificationSteps.map((section) => section.section || "Specification"),
    "Design",
    "Delivery",
  ]), [specificationSteps]);

  // Breadcrumb
  const breadcrumb = useMemo(() => {
    const parts = ["SVL"];
    if (selectedCategory) parts.push(selectedCategory.name);
    if (selectedType) parts.push(selectedType.name);
    if (selectedSubtype) parts.push(selectedSubtype.name);
    return parts.join(" > ");
  }, [selectedCategory, selectedType, selectedSubtype]);

  const handleCategoryChange = (id) => {
    setCategoryId(id);
    setTypeId("");
    setSubtypeId("");
    setSpecs({});
  };

  const handleTypeChange = (id) => {
    setTypeId(id);
    setSubtypeId("");
    setSpecs({});
  };

  const handleSpecChange = useCallback((key, value) => {
    setSpecs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSelectSpecChange = useCallback((field, value) => {
    // Handle custom size selection first so sticker size uses mm/inch instead of the generic custom popup.
    if (field.key === "size" && value === "Custom") {
      const typeName = (selectedType?.name || "").toLowerCase().trim();
      const subtypeName = (selectedSubtype?.name || "").toLowerCase().trim();
      const isSticker = typeName.includes("sticker") || subtypeName.includes("sticker");
      const isCard = typeName.includes("card") || subtypeName.includes("card");
      const hasDepthField = (productFields || []).some((f) => f.key === "customDepth");
      const useMm = hasDepthField || isSticker || isCard;
      let unitLabel = "ft";
      if (isSticker) unitLabel = "mm or inch";
      else if (isCard || hasDepthField) unitLabel = "mm";

      if (hasDepthField) {
        setDepthSizeDialog({
          open: true,
          field,
          width: specs.customWidth || "",
          height: specs.customHeight || "",
          depth: specs.customDepth || "",
          sizeUnit: useMm ? "mm" : "ft",
        });
        return;
      }

      setCustomSpecDialog({
        open: true,
        field,
        value: "",
        isFlexCustomSize: true,
        flexWidth: specs.customWidth || "",
        flexHeight: specs.customHeight || "",
        customSizeUnitLabel: unitLabel,
        sizeUnit: useMm ? "mm" : "ft",
      });
      return;
    }

    if (field.allowCustom && value === "Custom") {
      setCustomSpecDialog({
        open: true,
        field,
        value: String(specs[`${field.key}Custom`] || "").trim(),
        isFlexCustomSize: false,
        flexWidth: "",
        flexHeight: "",
        customSizeUnitLabel: "ft",
        sizeUnit: "mm",
      });
      return;
    }

    setSpecs((prev) => {
      const next = { ...prev, [field.key]: value };
      if (field.allowCustom && value !== "Custom") {
        delete next[`${field.key}Custom`];
      }
      return next;
    });
  }, [specs, productFields, selectedType, selectedSubtype]);

  const closeCustomSpecDialog = useCallback(() => {
    setCustomSpecDialog({ open: false, field: null, value: "", isFlexCustomSize: false, flexWidth: "", flexHeight: "", customSizeUnitLabel: "ft", sizeUnit: "mm" });
  }, []);

  const saveCustomSpecDialog = useCallback(() => {
    const field = customSpecDialog.field;
    if (!field) return;

    // Handle flex printing custom size
    if (customSpecDialog.isFlexCustomSize) {
      const width = String(customSpecDialog.flexWidth || "").trim();
      const height = String(customSpecDialog.flexHeight || "").trim();

      if (!width || !height) {
        setError("Please enter both width and height");
        return;
      }

      setSpecs((prev) => ({
        ...prev,
        [field.key]: "Custom",
        customWidth: width,
        customHeight: height,
        customUnit: customSpecDialog.sizeUnit,
      }));
      closeCustomSpecDialog();
      setError("");
      return;
    }

    // Handle regular custom field
    const trimmedValue = String(customSpecDialog.value || "").trim();
    if (!trimmedValue) {
      setSpecs((prev) => {
        const next = { ...prev };
        delete next[field.key];
        delete next[`${field.key}Custom`];
        return next;
      });
      closeCustomSpecDialog();
      return;
    }

    setSpecs((prev) => ({
      ...prev,
      [field.key]: "Custom",
      [`${field.key}Custom`]: trimmedValue,
    }));
    closeCustomSpecDialog();
  }, [closeCustomSpecDialog, customSpecDialog]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!useDesignFolderUpload) return;
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (!useDesignFolderUpload) return;
    try {
      const droppedFiles = await collectDroppedFiles(e.dataTransfer?.items);
      if (droppedFiles.length > 0) {
        setFiles((prev) => [...prev, ...droppedFiles]);
        return;
      }
      const fallbackFiles = Array.from(e.dataTransfer?.files || []);
      if (fallbackFiles.length > 0) {
        setFiles((prev) => [...prev, ...fallbackFiles]);
      }
    } catch {
      const fallbackFiles = Array.from(e.dataTransfer?.files || []);
      if (fallbackFiles.length > 0) {
        setFiles((prev) => [...prev, ...fallbackFiles]);
      }
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation per step
  const canProceed = (s) => {
    if (s === 0) {
      if (!categoryId || !typeId) return false;
      // If subtypes are available, must select one
      const subtypesForSelectedType = allTypes.filter((t) => String(t.parentId) === String(typeId));
      if (subtypesForSelectedType.length > 0) {
        return !!subtypeId;
      }
      return true;
    }
    if (s >= firstSpecificationStep && s < designStep) {
      if (!quantity || Number(quantity) <= 0) return false;
      
      // For flex printing and agralic products with custom size, validate width and height
      if (specs.size === "Custom" && (selectedType?.name?.toLowerCase().includes("flex") || selectedType?.name?.toLowerCase().includes("agralic"))) {
        return !!specs.customWidth && !!specs.customHeight && Number(specs.customWidth) > 0 && Number(specs.customHeight) > 0;
      }
      
      return true;
    }
    if (s === designStep) {
      return !useDesignFolderUpload || files.length > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (!canProceed(step)) {
      if (step === 0) {
        const subtypesForType = allTypes.filter((t) => String(t.parentId) === String(typeId));
        if (subtypesForType.length > 0 && !subtypeId) {
          setError("Please select a product subtype");
        } else {
          setError("Please select category and product");
        }
      }
      else if (step >= firstSpecificationStep && step < designStep) {
      if (!quantity || Number(quantity) <= 0) {
        setError("Please enter a valid quantity");
      } else if (specs.size === "Custom" && (selectedType?.name?.toLowerCase().includes("flex") || selectedType?.name?.toLowerCase().includes("agralic"))) {
        setError("Please enter valid width and height for custom size");
      } else {
        setError("Please complete the specifications");
      }
      } else if (step === designStep) setError("Please upload at least one design file before proceeding");
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, deliveryStep));
  };

  const handleBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (!leadId) return;
    setError("");
    setSaving(true);
    try {
      const data = {
        leadId,
        categoryId: Number(categoryId),
        typeId: Number(typeId),
        subtypeId: subtypeId ? Number(subtypeId) : null,
        quantity: Number(quantity) || 0,
        specs: JSON.stringify(specs),
        designStatus: null,
        designNotes: designNotes || null,
        fileFormat: null,
        colourMode: null,
        stylePreference: stylePreference || null,
        colourPreference: colourPreference || null,
        referenceNotes: referenceNotes || null,
        brandColours: brandColours || null,
        deliveryDate: deliveryDate || null,
        specialInstructions: specialInstructions || null,
      };
      if (isEditing) {
        await updateRequirement(initialRequirement.id, data, files);
      } else {
        await createRequirement(data, files);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to save requirement";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  const shouldReduceMotion = false;

  return (
    <>
      <div
        className="modal fade show requirement-form-modal"
        style={{ display: "block" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isEditing ? "Edit Requirement" : "Add Requirement"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={saving}
              />
            </div>
            <div className="modal-body">
              <div className="lead-wizard">
                {/* Breadcrumb */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <small className="text-muted">{breadcrumb}</small>
                  {step > 0 && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0"
                      onClick={() => {
                        setStep(0);
                        setError("");
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>

                {error && (
                  <div className="alert alert-danger py-2 mb-3" role="alert">
                    {error}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="lead-wizard-progress-bar">
                  <motion.div
                    className="lead-wizard-progress"
                    initial={shouldReduceMotion ? false : { width: "0%" }}
                    animate={
                      shouldReduceMotion
                        ? {}
                        : { width: `${((step + 1) / stepLabels.length) * 100}%` }
                    }
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </div>

                {/* Step Circles */}
                <motion.div
                  className="lead-wizard-circles"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                >
                  {stepLabels.map((label, idx) => (
                    <div
                      key={label}
                      className="lead-wizard-circle-item"
                      onClick={() => {
                        if (idx < step) {
                          setStep(idx);
                          setError("");
                        }
                      }}
                      style={{ cursor: idx < step ? "pointer" : "default" }}
                    >
                      <motion.div
                        className={`lead-wizard-circle${step >= idx ? " active" : ""}`}
                        initial={shouldReduceMotion ? false : { scale: 0.94 }}
                        animate={shouldReduceMotion ? {} : { scale: 1 }}
                        transition={{ duration: 0.2, delay: 0.08 + idx * 0.02 }}
                      >
                        <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {idx + 1}
                        </span>
                      </motion.div>
                      <div className="lead-wizard-circle-label">{label}</div>
                    </div>
                  ))}
                </motion.div>

                {/* Step Content */}
                <motion.div
                  className="lead-create-grid"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.1 }}
                >
                  <AnimatePresence mode="wait">
                    {/* Step 0: Product Selection */}
                    {step === 0 && (
                      <motion.div
                        key="step-0"
                        initial={shouldReduceMotion ? false : { opacity: 0, x: 18, filter: "blur(4px)" }}
                        animate={shouldReduceMotion ? {} : { opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? false : { opacity: 0, x: -18, filter: "blur(4px)" }}
                        transition={{ duration: 0.26, ease: "easeOut" }}
                        className="row g-3 lead-wizard-step-panel"
                      >
                        <div className="col-md-6">
                          <div className="lead-form-field">
                            <label className="form-label fw-semibold">
                              Category <span className="text-danger">*</span>
                            </label>
                            <select
                              className="form-select"
                              value={categoryId}
                              onChange={(e) => handleCategoryChange(e.target.value)}
                            >
                              <option value="">Select category</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="lead-form-field">
                            <label className="form-label fw-semibold">
                              Product <span className="text-danger">*</span>
                            </label>
                            <select
                              className="form-select"
                              value={typeId}
                              onChange={(e) => handleTypeChange(e.target.value)}
                              disabled={!categoryId}
                            >
                              <option value="">Select product</option>
                              {typeOptions.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {typeId && subtypeOptions.length > 0 && (
                          <div className="col-md-6">
                            <div className="lead-form-field">
                              <label className="form-label fw-semibold">Sub-Product</label>
                              <select
                                className="form-select"
                                value={subtypeId}
                                onChange={(e) => setSubtypeId(e.target.value)}
                              >
                                <option value="">Select sub-type</option>
                                {subtypeOptions.map((st) => (
                                  <option key={st.id} value={st.id}>
                                    {st.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                        {selectedCategory && (
                          <div className="col-12">
                            <div className="alert alert-info py-2 mb-0">
                              {selectedType
                                ? `Selected flow: ${selectedCategory.name} / ${selectedType.name}${selectedSubtype ? ` / ${selectedSubtype.name}` : ""}`
                                : `Select a product under ${selectedCategory.name} to continue.`}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Step 1: Product Specifications */}
                    {isSpecificationStep && (
                      <motion.div
                        key={`step-spec-${step}`}
                        initial={shouldReduceMotion ? false : { opacity: 0, x: 18, filter: "blur(4px)" }}
                        animate={shouldReduceMotion ? {} : { opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? false : { opacity: 0, x: -18, filter: "blur(4px)" }}
                        transition={{ duration: 0.26, ease: "easeOut" }}
                        className="row g-3 lead-wizard-step-panel"
                      >
                        {isFirstSpecificationStep && (
                          <div className="col-md-6">
                            <div className="lead-form-field">
                              <label className="form-label">
                                Quantity <span className="text-danger">*</span>
                              </label>
                              <input
                                className="form-control"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="Enter quantity"
                              />
                            </div>
                          </div>
                        )}

                        {/* Product-specific fields */}
                        {productFields ? (
                          [currentSpecification].flatMap((entry, sectionIndex) => {
                            const sectionFields = entry.fields.flatMap((field) => {
                              // Skip hidden fields
                              if (field.hidden) return [];

                              if (field.type === "computed") {
                                const val = field.compute(specs);
                                return (
                                  <div key={field.key} className="col-md-6">
                                    <div className="lead-form-field">
                                      <label className="form-label">{field.label}</label>
                                      <input
                                        className="form-control"
                                        value={val}
                                        readOnly
                                      />
                                    </div>
                                  </div>
                                );
                              }
                              if (field.type === "select") {
                                const result = [
                                  <div key={field.key} className="col-md-6">
                                    <div className="lead-form-field">
                                      <label className="form-label">{field.label}</label>
                                      <select
                                        className="form-select"
                                        value={specs[field.key] || ""}
                                        onChange={(e) => handleSelectSpecChange(field, e.target.value)}
                                        title={field.allowCustom && specs[field.key] === "Custom" ? (field.key === "size" ? (specs.customWidth || specs.customHeight ? `Custom: ${specs.customWidth} ${specs.customUnit || "ft"} × ${specs.customHeight} ${specs.customUnit || "ft"}${specs.customDepth ? ` × ${specs.customDepth} ${specs.customUnit || "ft"}` : ""}` : "Custom") : `Custom: ${specs[`${field.key}Custom`] || ""}`) : ""}
                                      >
                                        <option value="">Select {field.label}</option>
                                        {field.options.map((opt) => {
                                          if (opt === "Custom" && field.allowCustom && specs[field.key] === "Custom") {
                                            if (field.key === "size") {
                                              const width = specs.customWidth;
                                              const height = specs.customHeight;
                                              const depth = specs.customDepth;
                                              const unit = specs.customUnit || "ft";
                                              return (
                                                <option key={opt} value={opt}>
                                                  {width || height ? `Custom: ${width} ${unit} × ${height} ${unit}${depth ? ` × ${depth} ${unit}` : ""}` : "Custom"}
                                                </option>
                                              );
                                            }
                                            const customValue = specs[`${field.key}Custom`];
                                            return (
                                              <option key={opt} value={opt}>
                                                {customValue ? `Custom: ${customValue}` : "Custom"}
                                              </option>
                                            );
                                          }
                                          return (
                                            <option key={opt} value={opt}>
                                              {opt}
                                            </option>
                                          );
                                        })}
                                      </select>
                                    </div>
                                  </div>,
                                ];

                                return result;
                              }
                              return (
                                <div key={field.key} className="col-md-6">
                                  <div className="lead-form-field">
                                    <label className="form-label">{field.label}</label>
                                    <input
                                      className="form-control"
                                      type={field.type === "number" ? "number" : "text"}
                                      value={specs[field.key] ?? (field.default || "")}
                                      onChange={(e) =>
                                        handleSpecChange(field.key, e.target.value)
                                      }
                                      placeholder={field.placeholder || ""}
                                    />
                                  </div>
                                </div>
                              );
                            });

                            // Don't show section header if only 1 step total, or this is the first step with no previous section
                            if (specificationStepCount <= 1 || sectionIndex === 0) {
                              return sectionFields;
                            }

                            return [
                              <div key={`section-${sectionIndex}`} className="col-12 mt-1">
                                <div className="d-flex align-items-center justify-content-between">
                                  <h6 className="mb-2 fw-semibold">{entry.section}</h6>
                                </div>
                                <hr className="mt-0 mb-3" />
                              </div>,
                              ...sectionFields,
                            ];
                          })
                        ) : (
                          <div className="col-12">
                            <div className="alert alert-info py-2 mb-0">
                              No product-specific fields configured for this type. You can still add quantity and proceed.
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Step 2: Design */}
                    {step === designStep && (
                      <motion.div
                        key={`step-design-${step}`}
                        initial={shouldReduceMotion ? false : { opacity: 0, x: 18, filter: "blur(4px)" }}
                        animate={shouldReduceMotion ? {} : { opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? false : { opacity: 0, x: -18, filter: "blur(4px)" }}
                        transition={{ duration: 0.26, ease: "easeOut" }}
                        className="row g-3 lead-wizard-step-panel"
                      >
                        {false && (<div className="col-12">
                          <label className="form-label fw-semibold">
                            Design Status <span className="text-danger">*</span>
                          </label>
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            {[
                              { value: "full_design", label: "Customer has full design ready" },
                              { value: "logo_only", label: "Customer has logo only — we design the rest" },
                              { value: "no_design", label: "No design — we design everything" },
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                className={`btn btn-sm ${designStatus === opt.value ? "btn-primary" : "btn-outline-secondary"}`}
                                onClick={() => setDesignStatus(opt.value)}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>)}

                        <div className="col-12">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="designFolderUploadSwitch"
                              checked={useDesignFolderUpload}
                              onChange={(e) => setUseDesignFolderUpload(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="designFolderUploadSwitch">
                              Customer has design folder
                            </label>
                          </div>
                          <small className="text-muted">
                            Turn this on to upload all design files together as a folder.
                          </small>
                        </div>

                        {useDesignFolderUpload && (
                          <div className="col-12">
                            <label className="form-label fw-semibold">Design Folder</label>
                            <label
                              className={`w-100 rounded-3 p-4 text-center ${isDragActive ? "border border-primary bg-light" : "border border-secondary-subtle"}`}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              style={{ cursor: "pointer", borderStyle: "dashed" }}
                            >
                              <input
                                type="file"
                                className="d-none"
                                multiple
                                webkitdirectory=""
                                directory=""
                                onChange={handleFileChange}
                              />
                              <div className="fw-semibold mb-1">
                                Drag and drop the design folder here
                              </div>
                              <small className="text-muted">
                                or click this area to choose the folder
                              </small>
                            </label>
                            {files.length > 0 && (
                              <div className="mt-2">
                                {files.map((f, i) => (
                                  <div
                                    key={`${f.name}-${i}`}
                                    className="d-flex align-items-center gap-2 py-1"
                                  >
                                    <i className="ti ti-folder text-muted" />
                                    <span className="text-truncate" style={{ maxWidth: 320 }}>
                                      {f.name}
                                    </span>
                                    <small className="text-muted">
                                      ({(f.size / 1024).toFixed(1)} KB)
                                    </small>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger ms-auto"
                                      onClick={() => removeFile(i)}
                                    >
                                      <i className="ti ti-x" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Option A: Full design */}
                        {designStatus === "full_design" && (
                          <>
                            <div className="col-12">
                              <label className="form-label">Note</label>
                              <textarea
                                className="form-control"
                                rows={3}
                                value={designNotes}
                                onChange={(e) => setDesignNotes(e.target.value)}
                                placeholder="Any instructions from customer about the file"
                              />
                            </div>
                          </>
                        )}

                        {/* Option B: Logo only */}
                        {designStatus === "logo_only" && (
                          <>
                            <div className="col-md-6">
                              <label className="form-label">Brand Colours</label>
                              <input
                                className="form-control"
                                value={brandColours}
                                onChange={(e) => setBrandColours(e.target.value)}
                                placeholder='e.g. Red #E63E2A, White'
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Reference / Inspiration</label>
                              <textarea
                                className="form-control"
                                rows={2}
                                value={referenceNotes}
                                onChange={(e) => setReferenceNotes(e.target.value)}
                                placeholder="Customer's design preferences"
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Note</label>
                              <textarea
                                className="form-control"
                                rows={2}
                                value={designNotes}
                                onChange={(e) => setDesignNotes(e.target.value)}
                                placeholder="Additional notes"
                              />
                            </div>
                          </>
                        )}

                        {/* Option C: No design */}
                        {designStatus === "no_design" && (
                          <>
                            <div className="col-md-6">
                              <label className="form-label">Style Preference</label>
                              <select
                                className="form-select"
                                value={stylePreference}
                                onChange={(e) => setStylePreference(e.target.value)}
                              >
                                <option value="">Select style</option>
                                {STYLE_PREF_OPTIONS.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Colour Preference</label>
                              <input
                                className="form-control"
                                value={colourPreference}
                                onChange={(e) => setColourPreference(e.target.value)}
                                placeholder="Preferred colours"
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Reference Links or Notes</label>
                              <textarea
                                className="form-control"
                                rows={3}
                                value={referenceNotes}
                                onChange={(e) => setReferenceNotes(e.target.value)}
                                placeholder="Reference links, inspiration, or notes"
                              />
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}

                    {/* Step 3: Delivery */}
                    {step === deliveryStep && (
                      <motion.div
                        key={`step-delivery-${step}`}
                        initial={shouldReduceMotion ? false : { opacity: 0, x: 18, filter: "blur(4px)" }}
                        animate={shouldReduceMotion ? {} : { opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? false : { opacity: 0, x: -18, filter: "blur(4px)" }}
                        transition={{ duration: 0.26, ease: "easeOut" }}
                        className="row g-3 lead-wizard-step-panel"
                      >
                        <div className="col-md-6">
                          <div className="lead-form-field">
                            <label className="form-label">Delivery Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={deliveryDate}
                              onChange={(e) => setDeliveryDate(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="col-12">
                          <label className="form-label">Special Instructions</label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                            placeholder="Any special instructions for this order"
                            style={{ resize: "vertical" }}
                          />
                        </div>

                        <div className="col-12">
                          <div className="alert alert-secondary py-2 mb-0">
                            Files are handled in the Design step. No extra file upload is needed here.
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Wizard Navigation */}
                <motion.div
                  className="lead-wizard-nav"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: 0.18 }}
                >
                  {step > 0 ? (
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={handleBack}
                      disabled={saving}
                    >
                      Previous
                    </button>
                  ) : (
                    <div />
                  )}
                  {step < deliveryStep ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleNext}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      disabled={saving}
                    >
                      {saving
                        ? (isEditing ? "Updating..." : "Saving...")
                        : (isEditing ? "Update Requirement" : "Save Requirement")}
                    </button>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {customSpecDialog.open && (
        <div
          className="modal fade show requirement-form-modal"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.35)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxHeight: "auto", maxWidth: "500px", display: "flex", alignItems: "center" }}>
            <div className="modal-content" style={{ maxHeight: "auto", display: "flex", flexDirection: "column", overflowY: "visible" }}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {customSpecDialog.isFlexCustomSize ? "Enter Custom Size" : `Enter Custom ${customSpecDialog.field?.label}`}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeCustomSpecDialog}
                />
              </div>
              <div className="modal-body" style={{ overflowY: "auto", flex: 1, padding: "1.5rem" }}>
                {customSpecDialog.isFlexCustomSize ? (
                  <>
                    <div className="lead-form-field mb-3">
                      <label className="form-label">Unit <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={customSpecDialog.sizeUnit}
                        onChange={(e) =>
                          setCustomSpecDialog((prev) => ({ ...prev, sizeUnit: e.target.value }))
                        }
                      >
                        <option value="mm">Millimeters (mm)</option>
                        <option value="cm">Centimeters (cm)</option>
                        <option value="ft">Feet (ft)</option>
                        <option value="inch">Inches (inch)</option>
                      </select>
                    </div>
                    <div className="lead-form-field mb-3">
                      <label className="form-label">Width ({customSpecDialog.sizeUnit}) <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        type="number"
                        autoFocus
                        value={customSpecDialog.flexWidth}
                        onChange={(e) =>
                          setCustomSpecDialog((prev) => ({ ...prev, flexWidth: e.target.value }))
                        }
                        placeholder={`Enter width in ${customSpecDialog.sizeUnit}`}
                      />
                    </div>
                    <div className="lead-form-field mb-3">
                      <label className="form-label">Height ({customSpecDialog.sizeUnit}) <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        type="number"
                        value={customSpecDialog.flexHeight}
                        onChange={(e) =>
                          setCustomSpecDialog((prev) => ({ ...prev, flexHeight: e.target.value }))
                        }
                        placeholder={`Enter height in ${customSpecDialog.sizeUnit}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveCustomSpecDialog();
                          }
                        }}
                      />
                    </div>
                    {error && <div className="alert alert-danger mt-2 py-2 mb-0">{error}</div>}
                  </>
                ) : (
                  <div className="lead-form-field">
                    <label className="form-label">
                      {customSpecDialog.field?.label}
                    </label>
                    <input
                      className="form-control"
                      autoFocus
                      value={customSpecDialog.value}
                      onChange={(e) =>
                        setCustomSpecDialog((prev) => ({ ...prev, value: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          saveCustomSpecDialog();
                        }
                      }}
                      placeholder={
                        customSpecDialog.field?.customPlaceholder ||
                        `Enter ${customSpecDialog.field?.label || "value"}`
                      }
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={closeCustomSpecDialog}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveCustomSpecDialog}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Depth Size popup for products with Width + Height + Depth */}
      {depthSizeDialog.open && (
        <div
          className="modal fade show requirement-form-modal"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "500px" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter Custom Size</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDepthSizeDialog({ open: false, width: "", height: "", depth: "", sizeUnit: "mm" })}
                />
              </div>
              <div className="modal-body" style={{ padding: "1.5rem" }}>
                <div className="lead-form-field mb-3">
                  <label className="form-label">Unit <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={depthSizeDialog.sizeUnit}
                    onChange={(e) => setDepthSizeDialog((prev) => ({ ...prev, sizeUnit: e.target.value }))}
                  >
                    <option value="mm">Millimeters (mm)</option>
                    <option value="cm">Centimeters (cm)</option>
                    <option value="ft">Feet (ft)</option>
                    <option value="inch">Inches (inch)</option>
                  </select>
                </div>
                <div className="lead-form-field mb-3">
                  <label className="form-label">Width ({depthSizeDialog.sizeUnit}) <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    type="number"
                    autoFocus
                    value={depthSizeDialog.width}
                    onChange={(e) => setDepthSizeDialog((prev) => ({ ...prev, width: e.target.value }))}
                    placeholder={`Enter width in ${depthSizeDialog.sizeUnit}`}
                  />
                </div>
                <div className="lead-form-field mb-3">
                  <label className="form-label">Height ({depthSizeDialog.sizeUnit}) <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    type="number"
                    value={depthSizeDialog.height}
                    onChange={(e) => setDepthSizeDialog((prev) => ({ ...prev, height: e.target.value }))}
                    placeholder={`Enter height in ${depthSizeDialog.sizeUnit}`}
                  />
                </div>
                <div className="lead-form-field mb-3">
                  <label className="form-label">Depth ({depthSizeDialog.sizeUnit})</label>
                  <input
                    className="form-control"
                    type="number"
                    value={depthSizeDialog.depth}
                    onChange={(e) => setDepthSizeDialog((prev) => ({ ...prev, depth: e.target.value }))}
                    placeholder={`Enter depth in ${depthSizeDialog.sizeUnit}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const w = String(depthSizeDialog.width || "").trim();
                        const h = String(depthSizeDialog.height || "").trim();
                        if (!w || !h) return;
                        setSpecs((prev) => ({
                          ...prev,
                          size: "Custom",
                          customWidth: w,
                          customHeight: h,
                          customDepth: String(depthSizeDialog.depth || "").trim(),
                          customUnit: depthSizeDialog.sizeUnit,
                        }));
                        setDepthSizeDialog({ open: false, width: "", height: "", depth: "", sizeUnit: "mm" });
                      }
                    }}
                  />
                </div>
                {error && <div className="alert alert-danger mt-2 py-2 mb-0">{error}</div>}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setDepthSizeDialog({ open: false, width: "", height: "", depth: "", sizeUnit: "mm" })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const w = String(depthSizeDialog.width || "").trim();
                    const h = String(depthSizeDialog.height || "").trim();
                    if (!w || !h) {
                      setError("Please enter both width and height");
                      return;
                    }
                    setSpecs((prev) => ({
                      ...prev,
                      size: "Custom",
                      customWidth: w,
                      customHeight: h,
                      customDepth: String(depthSizeDialog.depth || "").trim(),
                      customUnit: depthSizeDialog.sizeUnit,
                    }));
                    setDepthSizeDialog({ open: false, width: "", height: "", depth: "", sizeUnit: "mm" });
                    setError("");
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="modal-backdrop fade show" />
    </>
  );
}
