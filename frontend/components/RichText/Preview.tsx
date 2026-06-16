import DOMPurify from "dompurify";

interface Props {
  content: string;
  title?: string;
  className?: string;
}

const RichTextPreview = ({ title, content, className }: Props) => {
  return (
    <>
      {title && (
        <h1 className="mb-4 text-2xl font-semibold uppercase">{title}</h1>
      )}
      <div
        className={`prose max-w-none rounded ${className}`}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
      />
    </>
  );
};

export default RichTextPreview;
