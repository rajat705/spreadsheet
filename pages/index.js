// pages/index.js

import Head from "next/head";
import Spreadsheet from "../components/Spreadsheet";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Spreadsheet App</title>
        <meta name="description" content="A simple spreadsheet application" />
      </Head>
      <Spreadsheet />
    </div>
  );
}
