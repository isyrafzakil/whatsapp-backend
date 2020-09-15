import mongoose from "mongoose";

// define data schema

const whatsappSchema = mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
  received: Boolean,
});

// This is where we give a name to our collection
export default mongoose.model("messagecontents", whatsappSchema);
