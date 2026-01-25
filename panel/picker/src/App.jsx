import './App.scss';
import LeftBar from './comp/LeftBar';
import Window from "./comp/Window"
import Canvas from "./comp/Canvas"
import Thumbnail from "./comp/Thumbnail"
import SelectInfo from "./comp/SelectInfo"
import SwipePanel from "./comp/SwipePanel"
import PickerArea from "./comp/PickerArea"
import PointManager from "./comp/PointManager"
import Dialogs from "./comp/Dialogs"
function App() {
  return (
    <>
      <Window>
        <div className="container">
            <LeftBar></LeftBar>
            <Canvas></Canvas>
            <Dialogs></Dialogs>
            <div className="rightNav">
              <Thumbnail></Thumbnail>
              <SelectInfo></SelectInfo>
              <SwipePanel panels={[
                ["采点区",PickerArea],["点管理",PointManager]
              ]}></SwipePanel>
            </div>
        </div>
      </Window>
    </>
  );
}

export default App;
