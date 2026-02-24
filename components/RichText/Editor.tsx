import { useCallback, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./quill-fonts.css";
import ImageInsertModal from "./ImageInsertModal";

import Quill from "quill";
const Font = Quill.import('formats/font');
const Size = Quill.import('formats/size');

// @ts-expect-error -- whitelist fonts
Font.whitelist = [
  'arial',
  'comic-sans',
  'courier-new',
  'georgia',
  'helvetica',
  'inter',
  'lucida',
  'times-new-roman',
  'verdana'
];
// @ts-expect-error -- whitelist fonts
Quill.register(Font, true);

// @ts-expect-error -- whitelist fonts
Size.whitelist = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '64px'];
// @ts-expect-error -- whitelist fonts
Quill.register(Size, true);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxHeight?: number; // New prop for max height with scroll
  // Toolbar options - all default to true
  allowImage?: boolean;
  allowHeader?: boolean;
  allowFont?: boolean;
  allowSize?: boolean;
  allowBold?: boolean;
  allowItalic?: boolean;
  allowUnderline?: boolean;
  allowStrike?: boolean;
  allowColor?: boolean;
  allowBackground?: boolean;
  allowAlign?: boolean;
  allowList?: boolean;
  allowLink?: boolean;
  allowClean?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  maxHeight,
  allowImage = true,
  allowHeader = true,
  allowFont = true,
  allowSize = true,
  allowBold = true,
  allowItalic = true,
  allowUnderline = true,
  allowStrike = true,
  allowColor = true,
  allowBackground = true,
  allowAlign = true,
  allowList = true,
  allowLink = true,
  allowClean = true,
}: Readonly<RichTextEditorProps>) {
  const quillRef = useRef<ReactQuill>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const imageHandler = useCallback(() => {
    if (!allowImage) return;
    setShowImageModal(true);
  }, [allowImage]);

  const modules = useMemo(() => {
    const toolbarContainer: (string | object)[][] = [];

    if (allowHeader) {
      toolbarContainer.push([{ header: [1, 2, 3, 4, 5, false] }]);
    }

    if (allowFont) {
      toolbarContainer.push([{
        font: [
          'arial',
          'comic-sans',
          'courier-new',
          'georgia',
          'helvetica',
          'inter',
          'lucida',
          'times-new-roman',
          'verdana'
        ]
      }]);
    }

    if (allowSize) {
      toolbarContainer.push([{ size: ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '64px'] }]);
    }

    const textFormats: string[] = [];
    if (allowBold) textFormats.push("bold");
    if (allowItalic) textFormats.push("italic");
    if (allowUnderline) textFormats.push("underline");
    if (allowStrike) textFormats.push("strike");
    if (textFormats.length > 0) {
      toolbarContainer.push(textFormats);
    }

    const colorFormats: object[] = [];
    if (allowColor) colorFormats.push({ color: [] });
    if (allowBackground) colorFormats.push({ background: [] });
    if (colorFormats.length > 0) {
      toolbarContainer.push(colorFormats);
    }

    if (allowAlign) {
      toolbarContainer.push([{ align: [] }]);
    }

    if (allowList) {
      toolbarContainer.push([{ list: "ordered" }, { list: "bullet" }]);
    }

    if (allowLink) {
      toolbarContainer.push(["link"]);
    }

    if (allowImage) {
      toolbarContainer.push(["image"]);
    }

    if (allowClean) {
      toolbarContainer.push(["clean"]);
    }

    return {
      toolbar: {
        container: toolbarContainer,
        handlers: allowImage ? { image: imageHandler } : {}
      }
    };
  }, [
    allowHeader, allowFont, allowSize, allowBold, allowItalic,
    allowUnderline, allowStrike, allowColor, allowBackground,
    allowAlign, allowList, allowLink, allowImage, allowClean, imageHandler
  ]);

  const formats = useMemo(() => {
    const baseFormats: string[] = [];

    if (allowHeader) baseFormats.push("header");
    if (allowFont) baseFormats.push("font");
    if (allowSize) baseFormats.push("size");
    if (allowBold) baseFormats.push("bold");
    if (allowItalic) baseFormats.push("italic");
    if (allowUnderline) baseFormats.push("underline");
    if (allowStrike) baseFormats.push("strike");
    if (allowColor) baseFormats.push("color");
    if (allowBackground) baseFormats.push("background");
    if (allowAlign) baseFormats.push("align");
    if (allowList) baseFormats.push("list");
    if (allowLink) baseFormats.push("link");
    if (allowImage) baseFormats.push("image");

    return baseFormats;
  }, [allowHeader, allowFont, allowSize, allowBold, allowItalic, allowUnderline, allowStrike, allowColor, allowBackground, allowAlign, allowList, allowLink, allowImage]);

  const handleInsertImage = useCallback(() => {
    const editor = quillRef.current?.getEditor();
    return editor ?? null;
  }, []);

  const editorClassName = maxHeight
    ? `w-full [&_.ql-container]:border-0! [&_.ql-formats]:mr-2! [&_.ql-editor]:max-h-[${maxHeight}px] [&_.ql-editor]:overflow-y-auto`
    : "w-full [&_.ql-container]:border-0! [&_.ql-container]:min-h-[120px] [&_.ql-editor]:min-h-[120px] [&_.ql-formats]:mr-2!";

  return (
    <>
      <div className="h-full w-full">
        <ReactQuill
          ref={quillRef}
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          theme="snow"
          className={editorClassName}
          style={{
            width: "100%",
            ...(maxHeight && {
              ['--editor-max-height' as string]: `${maxHeight}px`
            })
          }}
        />
      </div>

      {allowImage && (
        <ImageInsertModal
          open={showImageModal}
          getEditor={handleInsertImage}
          onCancel={() => setShowImageModal(false)}
        />
      )}

      {maxHeight && (
        <style>{`
          .ql-editor {
            max-height: ${maxHeight}px;
            height: 150px;
            overflow-y: auto;
          }
        `}</style>
      )}
    </>
  );
}