import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username:{ type: String, index: true },
  crawls: { type: [mongoose.Schema.ObjectId], default: [] },
});

userSchema.statics.findOneOrCreate = function findOneOrCreate(username) {
  const options = { upsert: true, returnOriginal: false };
  return this.findOneAndUpdate({ username }, { username }, options);
};

const crawlSchema = new mongoose.Schema({
  pages: { type: [mongoose.Schema.ObjectId], default: [] },
});

const pageSchema = new mongoose.Schema({
  url: String,
  links: { type: [mongoose.Schema.ObjectId], default: [] },
});

export const User = mongoose.model('User', userSchema);
export const Crawl = mongoose.model('Crawl', crawlSchema);
export const Page = mongoose.model('Page', pageSchema);
