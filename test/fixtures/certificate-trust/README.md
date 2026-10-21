# Certificate trust fixtures

`compromised-cas.json` contains public certificate variants from the [eMudhra incident](https://github.com/galadran/we-have-a-problem.com), including the twelve blocked intermediate and ancestor keys and their cross-sign paths.

The registry CA, leaf and private key are test-only loopback fixtures. The two incident leaf chains use the same loopback key and exercise both compromised authentication paths; no intermediate private key is stored here. Tests require private-registry TLS to succeed and both incident chains to fail.
