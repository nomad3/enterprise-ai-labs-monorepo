{{/*
Standard Helm chart labels, names, etc.
*/}}

{{/*
Expand the name of the chart.
Usage: {{ include "thefullstackagent.name" (dict "Chart" .Chart "Values" .Values) }}
*/}}
{{- define "thefullstackagent.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
Usage: {{ include "thefullstackagent.fullname" (dict "Chart" .Chart "Release" .Release "Values" .Values) }}
*/}}
{{- define "thefullstackagent.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
Usage: {{ include "thefullstackagent.chart" . }}
*/}}
{{- define "thefullstackagent.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels for all resources within the chart.
Usage: {{- include "thefullstackagent.labels.standard" . | nindent 4 }} (expects top-level .)
*/}}
{{- define "thefullstackagent.labels.standard" -}}
helm.sh/chart: {{ include "thefullstackagent.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/part-of: {{ include "thefullstackagent.name" . }} {{/* . here is top-level, has .Chart and .Values */}}
{{- end -}}

{{/*
Selector labels for a component.
Takes a context dict with .Release, .Chart, .Values, .componentName
Usage: {{- include "thefullstackagent.labels.selector" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" "my-component") | nindent 4 }}
*/}}
{{- define "thefullstackagent.labels.selector" -}}
app.kubernetes.io/name: {{ printf "%s-%s" (include "thefullstackagent.name" (dict "Chart" .Chart "Values" .Values)) .componentName | trunc 63 | trimSuffix "-" }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Labels for a specific component, including standard labels and selector labels.
Takes a context dict with .Release, .Chart, .Values, .componentName
Usage: {{- include "thefullstackagent.labels.component" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" "my-component") | nindent 4 }}
*/}}
{{- define "thefullstackagent.labels.component" -}}
{{ include "thefullstackagent.labels.standard" (dict "Chart" .Chart "Release" .Release "Values" .Values) }} {{/* Pass explicit dict */}}
{{ include "thefullstackagent.labels.selector" . }} {{/* . already has Chart, Release, Values, componentName */}}
{{- end -}}

{{/*
Create a fully qualified name for a component.
Takes a component name as context string.
Usage: {{ include "thefullstackagent.component.fullname" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" "my-component") }}
*/}}
{{- define "thefullstackagent.component.fullname" -}}
{{- $compFullName := printf "%s-%s" (include "thefullstackagent.fullname" .) .componentName -}}
{{- $compFullName | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Define a common application deployment structure.
Required context:
  .Chart, .Release, .Values (top level, or from subchart's perspective)
  .componentName (string)
  .componentValues (dict, e.g., .Values.devagentApi or .Values.devagentUi)
*/}}
{{- define "thefullstackagent.component.deployment" -}}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "thefullstackagent.component.fullname" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) }}
  labels:
    {{- include "thefullstackagent.labels.component" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) | nindent 4 }}
spec:
  {{- if not .componentValues.autoscaling.enabled }}
  replicas: {{ .componentValues.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "thefullstackagent.labels.selector" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) | nindent 6 }}
  template:
    metadata:
      {{- with .componentValues.podAnnotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      labels:
        {{- include "thefullstackagent.labels.component" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) | nindent 8 }}
    spec:
      {{- with .componentValues.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "thefullstackagent.component.fullname" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) }}
      securityContext:
        {{- toYaml .componentValues.podSecurityContext | nindent 8 }}
      containers:
        - name: {{ .componentName }}
          securityContext:
            {{- toYaml .componentValues.securityContext | nindent 12 }}
          image: "{{ .componentValues.image.repository }}:{{ .componentValues.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .componentValues.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .componentValues.service.targetPort }}
              protocol: TCP
          {{- if .componentValues.env }}
          env:
            {{- range $key, $value := .componentValues.env }}
            - name: {{ $key }}
              value: {{ $value | quote }}
            {{- end }}
          {{- end }}
          {{- if .componentValues.livenessProbe.enabled }}
          livenessProbe:
            httpGet:
              path: {{ .componentValues.livenessProbe.path }}
              port: http
            initialDelaySeconds: {{ .componentValues.livenessProbe.initialDelaySeconds }}
            periodSeconds: {{ .componentValues.livenessProbe.periodSeconds }}
          {{- end }}
          {{- if .componentValues.readinessProbe.enabled }}
          readinessProbe:
            httpGet:
              path: {{ .componentValues.readinessProbe.path }}
              port: http
            initialDelaySeconds: {{ .componentValues.readinessProbe.initialDelaySeconds }}
            periodSeconds: {{ .componentValues.readinessProbe.periodSeconds }}
          {{- end }}
          resources:
            {{- toYaml .componentValues.resources | nindent 12 }}
      {{- with .componentValues.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .componentValues.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .componentValues.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
{{- end -}}

{{/*
Define a common application service structure.
Required context:
  .Chart, .Release, .Values
  .componentName (string)
  .componentValues (dict, e.g., .Values.devagentApi or .Values.devagentUi)
*/}}
{{- define "thefullstackagent.component.service" -}}
apiVersion: v1
kind: Service
metadata:
  name: {{ include "thefullstackagent.component.fullname" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) }}
  labels:
    {{- include "thefullstackagent.labels.component" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) | nindent 4 }}
spec:
  type: {{ .componentValues.service.type }}
  ports:
    - port: {{ .componentValues.service.port }}
      targetPort: http # Refers to the container port name 'http'
      protocol: TCP
      name: http
  selector:
    {{- include "thefullstackagent.labels.selector" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) | nindent 4 }}
{{- end -}}

{{/*
Define a common application ingress structure.
Required context:
  .Chart, .Release, .Values
  .componentName (string)
  .componentValues (dict, e.g., .Values.devagentApi or .Values.devagentUi)
*/}}
{{- define "thefullstackagent.component.ingress" -}}
{{- if .componentValues.ingress.enabled -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "thefullstackagent.component.fullname" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) }}
  labels:
    {{- include "thefullstackagent.labels.component" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) | nindent 4 }}
  {{- with .componentValues.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if .componentValues.ingress.className }}
  ingressClassName: {{ .componentValues.ingress.className }}
  {{- end }}
  {{- if .componentValues.ingress.tls }}
  tls:
    {{- range .componentValues.ingress.tls }}
    - hosts:
        {{- range .hosts }}
        - {{ . | quote }}
        {{- end }}
      secretName: {{ .secretName }}
    {{- end }}
  {{- end }}
  rules:
    {{- range .componentValues.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            pathType: {{ .pathType }}
            backend:
              service:
                name: {{ include "thefullstackagent.component.fullname" (dict "Release" $.Release "Chart" $.Chart "Values" $.Values "componentName" $.componentName) }}
                port:
                  name: http
          {{- end }}
    {{- end }}
{{- end }}
{{- end -}} 