#!/usr/bin/env node

import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { database } from "../config/firebaseConfig-noreact.js";

const entregadorRef = collection(database, "users");
const docs = await getDocs(entregadorRef);
console.log(docs.docs.map((doc) => doc.data()));
