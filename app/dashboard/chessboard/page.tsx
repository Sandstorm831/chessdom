import { ReactElement } from "react";

export default function Page() {
    const chessBoardArray : ReactElement[] = [];
    for(let i=0; i<8; i++){
        for(let j=0; j<8; j++){
            if(i%2 === j%2) chessBoardArray.push(<div className="bg-[#eeeed2]"></div>);
            else chessBoardArray.push(<div className="bg-[#769656]"></div>)
        }
    }
  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="flex w-full justify-center">
        <div className="aspect-square w-2/5 bg-blue-500 grid grid-rows-8 grid-cols-8">
            {
                chessBoardArray && chessBoardArray.length ? chessBoardArray.map(elem => elem) : null
            }
        </div>
      </div>
    </div>
  );
}
