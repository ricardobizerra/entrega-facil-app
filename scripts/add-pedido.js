#!/usr/bin/env node

import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { database } from "../config/firebaseConfig.js";

const pedidoRef = collection(database, "products");
await addDoc(pedidoRef, {
  sensitive: true,
  weight: "medium",
  id: "BR928374656BR",
  address: "Rua Nova, Numero 58, Perto da estação de trem",
  location: { longitude: -8.0578, latitude: -34.8829 },
  creation_date: Timestamp.fromMillis(1722142468908),
  arrival_date: Timestamp.fromMillis(1722142468908),
  client_id: "teste@gmail.com",
  storage_code: "321",
  delivery_actions: [
    {
      timestamp: { seconds: 1722390522, nanoseconds: 539000000 },
      action: "Chegou ao armazém",
    },
  ],
  accepted: true,
  order_name: "Amazon #135",
  code: "123",
  status: "sent",
  icon: "https://www.simplilearn.com/ice9/free_resources_article_thumb/what_is_image_Processing.jpg",
  client_name: "John Doe",
});

const docs = await getDocs(
  query(pedidoRef, where("client_id", "==", "teste@gmail.com"))
);
console.log(docs.docs.map((doc) => doc.data()));
