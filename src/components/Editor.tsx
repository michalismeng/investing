import type EditorJS from "@editorjs/editorjs";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import "../styles/editor.css";
import { OutputData } from "@editorjs/editorjs";

interface EditorProps {
  editorId?: string;
  readonly?: boolean;
  initialContent?: OutputData;
  placeholder?: string | false;
  setBlocks?: Dispatch<SetStateAction<OutputData | undefined>>;
}

export const Editor: React.FC<EditorProps> = ({
  editorId = "editorjs",
  readonly = false,
  initialContent = { blocks: [] },
  placeholder = "Type here to start writing...",
  setBlocks,
}: EditorProps) => {
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
        async onChange() {
          setBlocks?.(await ref.current?.save());
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

  const className =
    readonly == false
      ? "card shadow-lg w-5/6 p-4 ps-16 outline outline-1 outline-gray-200 min-h-16"
      : "card shadow-lg w-full p-4 outline outline-1 outline-gray-200 min-h-16";

  return (
    <div className={className}>
      <div className="h-full w-full" id={editorId} />
    </div>
  );
};
