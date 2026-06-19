import ReviewScroller, { type Review } from "./ReviewScroller";

const CURATED_REVIEWS: Review[] = [
  {
    id: "1",
    author: "AkaBanuu",
    title: "Lowkey addictive",
    body: `Downloaded this just to check it out and ended up playing way longer than I expected. It's one of those games where you keep saying "just one more year." I like how many different paths you can take. Super easy to get into and addictive.`,
    rating: 5,
  },
  {
    id: "2",
    author: "Dolph Gobana",
    title: "Great game!",
    body: "I didn't expect to get this hooked onto this game! This game does an amazing job of making everyday choices feel meaningful without feeling overwhelmed. If you're into games that let you unwind while still feeling engaged, this is definitely worth your time!",
    rating: 5,
  },
  {
    id: "3",
    author: "jaii juice",
    title: "Immersive!!",
    body: "I like how the game gives you a lot of solid options to choose from, making the gameplay feel way longer and more engaging. It's like BitLife, but way more detailed and immersive.",
    rating: 5,
  },
  {
    id: "4",
    author: "Beccagamelover",
    title: "Fresh game — Never boring",
    body: "I honestly started playing this game with zero expectations and tried not to compare it to other similar popular games, but wow, so far my experience has been great. The game is so fun that it can keep you entertained for hours. Really excited to see what else gets added.",
    rating: 5,
  },
  {
    id: "5",
    author: "DopeMistress",
    title: "Cool!",
    body: "The game is very creative and immersive. 10/10 recommend to anybody who enjoys playing games very much like BitLife.",
    rating: 5,
  },
  {
    id: "6",
    author: "Camillaw12",
    title: "Hooked",
    body: "Been hooked since I downloaded.",
    rating: 5,
  },
  {
    id: "7",
    author: "Moonlight_luv16",
    title: "Shockingly Addictive",
    body: "Love the in-depth content!",
    rating: 5,
  },
];

export default function ReviewFeed() {
  return <ReviewScroller reviews={CURATED_REVIEWS} />;
}
