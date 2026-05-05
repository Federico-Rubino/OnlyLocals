// import { Redirect } from 'expo-router';
// import React from 'react';

// export default function AppStart() {
//   // Questo componente non mostra nessuna grafica, 
//   // prende l'utente e lo lancia immediatamente sulla pagina /login
//   return <Redirect href="/shop" />;
// }

import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken('pk.eyJ1IjoiZmRnciIsImEiOiJjbW9xejFmaGcyMnZrMnFzMWJrZDJxeXFxIn0.xGLxX_ZaX7avzio7VCRSbA');

const HomeScreen = () => {
 

 useEffect(() => {

 }, []);

 return (
   <View style={styles.page}>
     <View style={styles.container}>
       <Mapbox.MapView 
         style={styles.map} 
         styleURL={Mapbox.StyleURL.Outdoors} //Satellite, Dark, Light, Street.
         logoEnabled={false}               
         attributionEnabled={true}
       >
         
         <Mapbox.Camera 
           zoomLevel={13} 
           centerCoordinate={[9.1900, 45.4642]} // [Longitudine, Latitudine] - Milano
           animationMode={'flyTo'}
           animationDuration={2000}
         />

         {/* marker example */}
         <Mapbox.PointAnnotation
           id="marker-1"
           coordinate={[9.1900, 45.4642]}
         >
           <View style={styles.markerContainer}>
             <View style={styles.markerCore} />
           </View>
           
           {/* Callout on marker */}
           <Mapbox.Callout title="Ciao da OnlyLocals!" />
         </Mapbox.PointAnnotation>

       </Mapbox.MapView>
     </View>
   </View>
 );
};

export default HomeScreen;

const styles = StyleSheet.create({
 page: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
 },
 container: {
   height: '100%',
   width: '100%',
 },
 map: {
   flex: 1,
 },
 markerContainer: {
   height: 30,
   width: 30,
   alignItems: 'center',
   justifyContent: 'center',
   backgroundColor: 'rgba(255, 255, 255, 0.6)',
   borderRadius: 15,
 },
 markerCore: {
   height: 18,
   width: 18,
   backgroundColor: '#E6F4FE',
   borderRadius: 9,
   borderWidth: 2,
   borderColor: 'white',
 },
});
