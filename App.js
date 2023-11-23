import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Button, StyleSheet, Text, View, FlatList, PermissionsAndroid, Platform, NativeModules, NativeEventEmitter } from 'react-native';
import { useEffect, useState } from 'react';
import { broadcast, setCompanyId, stopBroadcast } from 'react-native-ble-advertise';
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleScanner = new NativeEventEmitter(BleManagerModule);

const COMPANY_ID = '0x00E0';
const UUID = '44C13E43-097A-9C9F-537F-5666A6840C08';
const MAJOR = '1234';
const MINOR = '4321';

export default function App() {
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [peripherals, setPeripherals] = useState(
    new Map()
  );


  useEffect(() => {
    BleManager.start({ showAlert: false });

    const listeners = [
      bleScanner.addListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoverPeripheral,
      )
    ];

    return () => {
      console.debug('[app] main component unmounting. Removing listeners...');
      for (const listener of listeners) {
        listener.remove();
      }
    };

  }, [])

  const addOrUpdatePeripheral = (id, updatedPeripheral) => {
    // new Map() enables changing the reference & refreshing UI.
    // TOFIX not efficient.
    setPeripherals(map => new Map(map.set(id, updatedPeripheral)));
  };

  const convertHashToHex = (value) => {
    return value.map(v => v.toString(16).padStart(2, '0')).join('');
  }

  const handleDiscoverPeripheral = (peripheral) => {
    console.debug('[handleDiscoverPeripheral] new BLE peripheral=', peripheral);
    if (!peripheral.name) {
      peripheral.RawData = convertHashToHex(peripheral.advertising.manufacturerData.bytes);
      peripheral.name = 'NO NAME';
    }
    addOrUpdatePeripheral(peripheral.id, peripheral);
  };

  const askForScanningPermission = async () => {
    var permissionsRequiredToBeAccepted = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ];

    if (Platform.Version >= 31) {
      permissionsRequiredToBeAccepted.push(...[
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    }

    const PermissionsGranted = await PermissionsAndroid.requestMultiple(permissionsRequiredToBeAccepted);

    console.log(PermissionsGranted);

  }

  const startScanning = async () => {
    if (!isScanning) {
      if (Platform.OS === 'android') await askForScanningPermission();
      setPeripherals(new Map());
      setIsScanning(true);
      BleManager.scan([], 0, true, {
        scanMode: 1,
        reportDelay: 1800,
      })
        .then(() => {
          console.debug('[startScan] scan promise returned successfully.');
        }).catch(err => {
          console.error('[startScan] ble scan returned in error', err);
        });
    }


  }

  const stopScanning = () => {
    BleManager.stopScan().then(() => { });
    setIsScanning(false);
  }

  const askForAdvertisingPermission = async () => {
    const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE);
    if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Permission denied');
    }
  };

  const startAdvertising = async () => {
    if (Platform.OS === 'android') await askForAdvertisingPermission();
    setCompanyId(parseInt(COMPANY_ID, 16));
    setIsAdvertising(true);
    broadcast(UUID, parseInt(MAJOR, 16), parseInt(MINOR, 16)).catch((error) => {
      console.log(error);
      setIsAdvertising(false);
    });
  };

  const stopAdvertising = async () => {
    setIsAdvertising(false);
    await stopBroadcast();
  };

  const renderItem = ({ item }) => {
    console.log(JSON.stringify(item));
    return (
      <View style={[styles.row, { backgroundColor: 'green' }]}>
        <Text style={styles.peripheralName}>
          {/* completeLocalName (item.name) & shortAdvertisingName (advertising.localName) may not always be the same */}
          {item.name} - {item?.advertising?.localName}
        </Text>
        <Text style={styles.rssi}>RSSI: {item.rssi}</Text>
        <Text style={styles.peripheralId}>{item.id}</Text>
        <Text style={styles.rawData}>Raw data: 0x<Text style={{textTransform:'uppercase'}}>{convertHashToHex(item.advertising.manufacturerData.bytes)}</Text></Text>

        
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text>Test</Text>
      <Button title={'Start advertising'} onPress={startAdvertising} disabled={isAdvertising || isScanning} />
      <Button title={'Stop advertising'} onPress={stopAdvertising} disabled={!isAdvertising} />
      <Button title={'Start scanning'} onPress={startScanning} disabled={isAdvertising || isScanning} />
      <Button title={'Stop scanning'} onPress={stopScanning} disabled={!isScanning} />
      {isAdvertising && (
        <>
          <Text>Advertising</Text>
          <ActivityIndicator size="large" color="black" />
        </>
      )}

      {Array.from(peripherals.values()).length === 0 && (
        <View style={styles.row}>
          <Text style={styles.noPeripherals}>
            No Peripherals, press "Scan Bluetooth" above.
          </Text>
        </View>
      )}

      <FlatList
        data={Array.from(peripherals.values())}
        contentContainerStyle={{ rowGap: 12 }}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={{ width: '100%' }}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  peripheralName: {
    fontSize: 16,
    textAlign: 'center',
    padding: 10,
  },
  rssi: {
    fontSize: 12,
    textAlign: 'center',
    padding: 2,
  },
  peripheralId: {
    fontSize: 12,
    textAlign: 'center',
    padding: 2,
  },
  row: {
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rawData:{
    fontSize: 12,
    textAlign: 'center',
    padding: 2,
    paddingBottom: 20,
  }
});
