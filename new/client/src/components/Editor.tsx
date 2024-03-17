import type EditorJS from "@editorjs/editorjs";
import { useCallback, useEffect, useRef, useState } from "react";
import "../styles/editor.css";
import { useForm } from "react-hook-form";
import { OutputData } from "@editorjs/editorjs";
import { Button } from "react-bootstrap";

interface EditorProps {
  editorId?: string;
  readonly?: boolean;
  initialContent?: OutputData;
  placeholder?: string | false,
  onSubmit?: (blocks: OutputData) => void;
}

export const Editor: React.FC<EditorProps> = ({
  editorId = "editorjs",
  readonly = false,
  initialContent = { blocks: [] },
  placeholder = "Type here to write your diary entry...",
  onSubmit = () => {},
}: EditorProps) => {
  const {
    handleSubmit,
  } = useForm<FormData & { content: string | null }>({
    defaultValues: {
      content: null,
    },
  });
  const ref = useRef<EditorJS>();
  const _titleRef = useRef<HTMLTextAreaElement>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const Embed = (await import("@editorjs/embed")).default;
    const Table = (await import("@editorjs/table")).default;
    const List = (await import("@editorjs/list")).default;

    if (!ref.current) {
      const editor = new EditorJS({
        holder: editorId,
        readOnly: readonly,
        onReady() {
          ref.current = editor;
        },
        placeholder: placeholder,
        inlineToolbar: true,
        data: initialContent,
        tools: {
          header: Header,
          list: List,
          table: Table,
          embed: Embed,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();

      setTimeout(() => {
        _titleRef?.current?.focus();
      }, 0);
    };

    if (isMounted) {
      init();

      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  async function onSubmitForm(_: FormData) {
    const blocks = await ref.current?.save();
    onSubmit(blocks!);
  }

  return (
    <div className="p-4" style={{ height: "100%" }}>
      <form className="w-fit" onSubmit={handleSubmit(onSubmitForm)}>
        <div id={editorId} />
        {readonly === false && (
          <Button variant="dark" type="submit">
            Submit
          </Button>
        )}
      </form>
    </div>
  );
};
