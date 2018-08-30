import { registerConversionMap } from "../lib/common/conversionMaps";
import { ProductsConvMap, TagsConvMap } from "../lib/conversionMaps";
import "./containers";
import "./components";
import "./styles/csvConnector.less";

registerConversionMap("Products", ProductsConvMap);
registerConversionMap("Tags", TagsConvMap);
