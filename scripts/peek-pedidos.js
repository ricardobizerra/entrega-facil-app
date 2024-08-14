#!/usr/bin/env node

import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { database } from "../config/firebaseConfig.js";

const entregadorRef = collection(database, "products");
const docs = await getDocs(entregadorRef);
docs.docs.map((doc) => {
  console.log(doc.data()), console.log(doc.data().delivery_actions);
});
