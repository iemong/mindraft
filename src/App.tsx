import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { Button } from "./components/ui/button";
import { BlockquoteExtension, BoldExtension, HeadingExtension, ItalicExtension } from 'remirror/extensions';
import { Heading, useRemirror } from '@remirror/react';
import { Remirror } from '@remirror/react';
import 'remirror/styles/all.css';

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  const extensions = () => [new BoldExtension({}), new ItalicExtension(), new BlockquoteExtension(), new HeadingExtension({levels: [1, 2, 3]})]

  const { manager, state } = useRemirror({
    extensions,
    content: '<p>I love <b>Remirror</b></p>',
    selection: 'start',
    stringHandler: 'html',
  });

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <article className='remirror-theme'>
        <Remirror manager={manager} initialContent={state} />
        </article>
        <Button variant={'default'}>Click me</Button>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank" rel="noreferrer">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
