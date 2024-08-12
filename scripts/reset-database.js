#!/usr/bin/env node

import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { database } from "../config/firebaseConfig.js";

const entregadorRef = collection(database, "entregador");
await addDoc(entregadorRef, {
  code: "4x56a113",
  name: "Diegoson",
  email: "Diegoson@gmail.com",
  password: "1234",
});
const docs = await getDocs(entregadorRef);
console.log(docs.docs.map((doc) => doc.data()));
