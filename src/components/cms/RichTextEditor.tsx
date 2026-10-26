'use client';

import React from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
  imagePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  InsertImage,
  MDXEditorMethods,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

/**
 * Editor de texto enriquecido basado en MDXEditor (Lexical)
 * Soporta: negrita, itálica, subrayado, encabezados, listas, enlaces, citas, deshacer/rehacer
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escriba aquí...',
  className = '',
  readOnly = false,
}: RichTextEditorProps) {
  const editorRef = React.useRef<MDXEditorMethods>(null);

  return (
    <div className={`border border-gray-200 rounded-md overflow-hidden ${className}`}>
      <MDXEditor
        ref={editorRef}
        markdown={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        plugins={[
          headingsPlugin({ headingLevels: [2, 3, 4] }),
          listsPlugin(),
          linkPlugin(),
          quotePlugin(),
          imagePlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BoldItalicUnderlineToggles options={['Bold', 'Italic', 'Underline']} />
                <BlockTypeSelect />
                <InsertImage />
              </>
            ),
          }),
        ]}
        contentEditableClassName="prose prose-sm max-w-none p-3 min-h-[120px] outline-none"
        className="mdx-editor-wrapper"
      />
    </div>
  );
}