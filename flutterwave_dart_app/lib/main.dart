import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutterwave_standard/flutterwave.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const SuperTechFlutterwaveApp());
}

class SuperTechFlutterwaveApp extends StatelessWidget {
  const SuperTechFlutterwaveApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'SuperTech Pay',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFF68B1E)),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF3F6F2),
      ),
      home: const CheckoutPage(),
    );
  }
}

class CheckoutPage extends StatefulWidget {
  const CheckoutPage({super.key});

  @override
  State<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage> {
  static const flutterwavePublicKey = String.fromEnvironment(
    'FLUTTERWAVE_PUBLIC_KEY',
  );
  static const verifyEndpoint = String.fromEnvironment(
    'PAYMENT_VERIFY_URL',
    defaultValue: '',
  );

  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController(text: '5000');
  final _nameController = TextEditingController(text: 'SuperTech Customer');
  final _emailController = TextEditingController(text: 'customer@example.com');
  final _phoneController = TextEditingController(text: '250780000000');
  final _currencyController = TextEditingController(text: 'RWF');

  bool _isTestMode = true;
  String _status = 'Ready to collect payment.';

  @override
  void dispose() {
    _amountController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _currencyController.dispose();
    super.dispose();
  }

  Future<void> _startPayment() async {
    if (!_formKey.currentState!.validate()) return;

    if (flutterwavePublicKey.isEmpty) {
      setState(() {
        _status =
            'Missing FLUTTERWAVE_PUBLIC_KEY. Pass it with --dart-define.';
      });
      return;
    }

    final txRef = 'SUPERTECH-${DateTime.now().millisecondsSinceEpoch}';
    final customer = Customer(
      name: _nameController.text.trim(),
      phoneNumber: _phoneController.text.trim(),
      email: _emailController.text.trim(),
    );

    final checkout = Flutterwave(
      publicKey: flutterwavePublicKey,
      currency: _currencyController.text.trim().toUpperCase(),
      redirectUrl: 'https://supertech.africa/payment/callback',
      txRef: txRef,
      amount: _amountController.text.trim(),
      customer: customer,
      paymentOptions: 'card, mobilemoney, ussd, bank transfer',
      customization: Customization(
        title: 'SuperTech Marketplace',
        description: 'Marketplace order payment',
        logo: 'https://supertech.africa/logo.png',
      ),
      isTestMode: _isTestMode,
    );

    setState(() => _status = 'Opening Flutterwave checkout...');

    try {
      final response = await checkout.charge(context);

      if (!mounted) return;

      if (response.success == true) {
        setState(() {
          _status =
              'Payment returned success. Verifying transaction ${response.transactionId ?? txRef}...';
        });
        await _verifyPayment(response, txRef);
      } else {
        setState(() {
          _status = 'Payment cancelled or failed. Status: ${response.status}';
        });
      }
    } catch (error) {
      if (!mounted) return;
      setState(() => _status = 'Payment error: $error');
    }
  }

  Future<void> _verifyPayment(ChargeResponse response, String txRef) async {
    if (verifyEndpoint.isEmpty) {
      setState(() {
        _status =
            'Checkout completed, but server verification is not configured. Verify on your backend before fulfilling the order.';
      });
      return;
    }

    final result = await http.post(
      Uri.parse(verifyEndpoint),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'transactionId': response.transactionId,
        'txRef': txRef,
        'expectedAmount': _amountController.text.trim(),
        'expectedCurrency': _currencyController.text.trim().toUpperCase(),
      }),
    );

    if (!mounted) return;

    if (result.statusCode >= 200 && result.statusCode < 300) {
      setState(() => _status = 'Payment verified by server.');
    } else {
      setState(() => _status = 'Server verification failed: ${result.body}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SuperTech Pay'),
        centerTitle: false,
        backgroundColor: const Color(0xFFF3F6F2),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            _HeroCard(isTestMode: _isTestMode),
            const SizedBox(height: 16),
            Form(
              key: _formKey,
              child: Column(
                children: [
                  _Field(
                    controller: _amountController,
                    label: 'Amount',
                    keyboardType: TextInputType.number,
                    validator: _requiredNumber,
                  ),
                  _Field(
                    controller: _currencyController,
                    label: 'Currency',
                    textCapitalization: TextCapitalization.characters,
                    validator: _required,
                  ),
                  _Field(
                    controller: _nameController,
                    label: 'Customer name',
                    validator: _required,
                  ),
                  _Field(
                    controller: _emailController,
                    label: 'Email',
                    keyboardType: TextInputType.emailAddress,
                    validator: _required,
                  ),
                  _Field(
                    controller: _phoneController,
                    label: 'Phone',
                    keyboardType: TextInputType.phone,
                    validator: _required,
                  ),
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Test mode'),
                    subtitle: const Text('Use Flutterwave test keys first.'),
                    value: _isTestMode,
                    onChanged: (value) => setState(() => _isTestMode = value),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: _startPayment,
              icon: const Icon(Icons.lock_outline),
              label: const Text('Pay with Flutterwave'),
              style: FilledButton.styleFrom(
                minimumSize: const Size.fromHeight(52),
                backgroundColor: const Color(0xFFF68B1E),
                foregroundColor: Colors.white,
                textStyle: const TextStyle(fontWeight: FontWeight.w800),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              elevation: 0,
              color: Colors.white,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  _status,
                  style: const TextStyle(height: 1.45),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String? _required(String? value) {
    if (value == null || value.trim().isEmpty) return 'Required';
    return null;
  }

  String? _requiredNumber(String? value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return 'Required';
    if (num.tryParse(text) == null) return 'Enter a valid amount';
    return null;
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.isTestMode});

  final bool isTestMode;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF102019),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isTestMode ? 'TEST CHECKOUT' : 'LIVE CHECKOUT',
            style: const TextStyle(
              color: Color(0xFFF4C95D),
              fontWeight: FontWeight.w900,
              letterSpacing: 1.6,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Collect SuperTech payments with Flutterwave.',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: 28,
              height: 1.05,
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Use your public key in the app, then verify every successful payment on your backend before delivering value.',
            style: TextStyle(color: Colors.white70, height: 1.45),
          ),
        ],
      ),
    );
  }
}

class _Field extends StatelessWidget {
  const _Field({
    required this.controller,
    required this.label,
    this.keyboardType,
    this.textCapitalization = TextCapitalization.none,
    this.validator,
  });

  final TextEditingController controller;
  final String label;
  final TextInputType? keyboardType;
  final TextCapitalization textCapitalization;
  final FormFieldValidator<String>? validator;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        textCapitalization: textCapitalization,
        validator: validator,
        decoration: InputDecoration(
          labelText: label,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
        ),
      ),
    );
  }
}
