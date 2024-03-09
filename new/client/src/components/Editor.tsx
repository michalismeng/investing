import type EditorJS from '@editorjs/editorjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import '../styles/editor.css'

// type FormData = z.infer<typeof PostValidator>

interface EditorProps {
  id: string;
}

export const Editor: React.FC<EditorProps> = ({ id }: EditorProps) => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<FormData>({
//     resolver: zodResolver(PostValidator),
//     defaultValues: {
//       subredditId,
//       title: '',
//       content: null,
//     },
//   })
  const ref = useRef<EditorJS>()
  const _titleRef = useRef<HTMLTextAreaElement>(null)
//   const router = useRouter()
  const [isMounted, setIsMounted] = useState<boolean>(false)
//   const pathname = usePathname()

//   const { mutate: createPost } = useMutation({
//     mutationFn: async ({
//       title,
//       content,
//       subredditId,
//     }: PostCreationRequest) => {
//       const payload: PostCreationRequest = { title, content, subredditId }
//       const { data } = await axios.post('/api/subreddit/post/create', payload)
//       return data
//     },
//     onError: () => {
//       return toast({
//         title: 'Something went wrong.',
//         description: 'Your post was not published. Please try again.',
//         variant: 'destructive',
//       })
//     },
//     onSuccess: () => {
//       // turn pathname /r/mycommunity/submit into /r/mycommunity
//       const newPathname = pathname.split('/').slice(0, -1).join('/')
//       router.push(newPathname)

//       router.refresh()

//       return toast({
//         description: 'Your post has been published.',
//       })
//     },
//   })

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default
    const Header = (await import('@editorjs/header')).default
    const Embed = (await import('@editorjs/embed')).default
    const Table = (await import('@editorjs/table')).default
    const List = (await import('@editorjs/list')).default
    const Code = (await import('@editorjs/code')).default
    const InlineCode = (await import('@editorjs/inline-code')).default

    if (!ref.current) {
      const editor = new EditorJS({
        holder: id,
        onReady() {
          ref.current = editor
        },
        placeholder: 'Type here to write your post...',
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed,
        },
      })
    }
  }, [])

//   useEffect(() => {
//     if (Object.keys(errors).length) {
//       for (const [_key, value] of Object.entries(errors)) {
//         value
//         toast({
//           title: 'Something went wrong.',
//           description: (value as { message: string }).message,
//           variant: 'destructive',
//         })
//       }
//     }
//   }, [errors])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMounted(true)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await initializeEditor()

      setTimeout(() => {
        _titleRef?.current?.focus()
      }, 0)
    }

    if (isMounted) {
      init()

      return () => {
        ref.current?.destroy()
        ref.current = undefined
      }
    }
  }, [isMounted, initializeEditor])

  if (!isMounted) {
    return null
  }

  return (
    <div className='p-4 bg-zinc-50 rounded border border-dark' style={{ height: "100%" }}>
      <form
        className='w-fit'
        // onSubmit={handleSubmit(onSubmit)}
        >
        <div className='prose prose-stone dark:prose-invert'>
          {/* <TextareaAutosize
            ref={(e) => {
            //   titleRef(e)
              // @ts-ignore
              _titleRef.current = e
            }}
            // {...rest}
            placeholder='Title'
            className='w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none'
          /> */}
          <div id={id}/>
          {/* <p className='mt-auto'>
            Use{' '}
            <kbd className='rounded border px-1 text-sm uppercase'>
              /
            </kbd>{' '}
            to open the command menu.
          </p> */}
        </div>
      </form>
    </div>
  )
}
